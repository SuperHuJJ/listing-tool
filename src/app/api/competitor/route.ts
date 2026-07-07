import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { supabaseAdmin } from '@/lib/supabase/server';
import { useCredit, refundCredit } from '@/lib/credits';
import { getCompetitorPrompt } from '@/lib/prompts'; // 新增

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
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

    const { content, productName, language } = await req.json();
    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    let creditResult;
    try {
      creditResult = await useCredit(user.id, 'competitor', 2);
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 402 });
    }

    try {
      const prompt = getCompetitorPrompt(language, content, productName); // 调用集中式函数

      const completion = await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是资深竞品分析专家。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
        max_tokens: 3000,
      });

      return NextResponse.json({
        result: completion.choices[0].message.content,
        creditsRemaining: creditResult.creditsRemaining,
        creditType: creditResult.type,
        trialRemaining: creditResult.trialRemaining,
      });
    } catch (aiError: any) {
      await refundCredit(user.id, creditResult.featureKeyInternal, creditResult.type, 2);
      return NextResponse.json({ error: aiError.message || 'AI request failed' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Competitor error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}