import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase/server';
import { getListingPrompt } from '@/lib/prompts';
import { generateRequestSchema } from '@/lib/validations';
import { useCredit, refundCredit } from '@/lib/credits';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
});

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
});

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 速率限制
    const { success, limit, reset, remaining } = await ratelimit.limit(user.id);
    if (!success) {
      return NextResponse.json(
        { error: '请求过于频繁，请稍后再试', limit, reset, remaining },
        { status: 429 }
      );
    }

    // 输入校验
    const body = await req.json();
    const validation = generateRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid input', details: validation.error.issues }, { status: 400 });
    }
    const { platform, language, productInfo } = validation.data;

    // 消费积分或试用
    let creditResult;
    try {
      creditResult = await useCredit(user.id, 'generate', 1);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 402 });
    }

    // 调用 DeepSeek
    try {
      const systemPrompt = getListingPrompt(platform, language);
      const userMessage = JSON.stringify(productInfo);

      const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const rawContent = completion.choices[0].message.content;
      if (!rawContent) throw new Error('Empty response from AI');

      let aiResult;
      try {
        aiResult = JSON.parse(rawContent);
        if (!aiResult.title || !Array.isArray(aiResult.bullets) || !aiResult.description) {
          throw new Error('Invalid AI response structure');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', rawContent);
        throw new Error('AI response was not valid JSON');
      }

      // 保存记录
      const tokensUsed = completion.usage?.total_tokens || 0;
      await supabaseAdmin.from('listings').insert({
        user_id: user.id,
        platform,
        language,
        input_data: productInfo,
        result: aiResult,
        model_used: 'deepseek-chat',
        tokens_used: tokensUsed,
      });

      return NextResponse.json({
        data: aiResult,
        creditsRemaining: creditResult.creditsRemaining,
        creditType: creditResult.type,
        trialRemaining: creditResult.trialRemaining,
        rateLimit: { limit, remaining: 0, reset },
      });
    } catch (aiError: any) {
      // AI 调用失败，退还积分/试用
      await refundCredit(
        user.id,
        creditResult.featureKeyInternal,
        creditResult.type,
        1
      );
      return NextResponse.json({ error: aiError.message || 'AI generation failed' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}