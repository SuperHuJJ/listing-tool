import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase/server';
import { useCredit, refundCredit } from '@/lib/credits';
import { getMultiVersionStylePrompt } from '@/lib/prompts';

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
});

export async function POST(req: Request) {
  try {
    // 1. 鉴权
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const token = authHeader.split(' ')[1];
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // 2. 接收参数
    const { platform, language, productInfo } = await req.json();
    if (!productInfo?.name || !productInfo?.features || !productInfo?.keywords) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 3. 消费积分或试用
    let creditResult;
    try {
      creditResult = await useCredit(user.id, 'versions', 4);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 402 });
    }

    // 4. 并发生成三个版本
    try {
      const userMessage = JSON.stringify(productInfo);
      const styles: Array<'professional' | 'emotional' | 'seo'> = ['professional', 'emotional', 'seo'];

      const promises = styles.map(async (style) => {
        const systemPrompt = getMultiVersionStylePrompt(platform, language, style);

        const completion = await openai.chat.completions.create({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage },
          ],
          temperature: 0.8,
          response_format: { type: 'json_object' },
        });
        const raw = completion.choices[0].message.content;
        return JSON.parse(raw!);
      });

      const results = await Promise.all(promises);

      return NextResponse.json({
        data: results,
        creditsRemaining: creditResult.creditsRemaining,
        creditType: creditResult.type,
        trialRemaining: creditResult.trialRemaining,
      });
    } catch (aiError: any) {
      // AI 调用失败，退还积分或试用次数
      await refundCredit(user.id, creditResult.featureKeyInternal, creditResult.type, 4);
      return NextResponse.json({ error: aiError.message || 'Multi-version generation failed' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Versions error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}