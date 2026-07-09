import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getListingPrompt } from '@/lib/prompts'
import { generateRequestSchema } from '@/lib/validations'
import { useCredit } from '@/lib/credits'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
})

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '1 m'),
  analytics: true,
})

export async function POST(req: Request) {
  try {
    // 1. 用户认证
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: '登录信息无效' }, { status: 401 })
    }

    // 2. 速率限制
    const { success } = await ratelimit.limit(user.id)
    if (!success) {
      return NextResponse.json({ error: '请求过于频繁，请稍后再试' }, { status: 429 })
    }

    // 3. 输入校验
    const body = await req.json()
    const validation = generateRequestSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({ error: '输入格式不正确' }, { status: 400 })
    }
    const { platform, language, productInfo } = validation.data

    // 4. 消费额度
    let creditResult
    try {
      creditResult = await useCredit(user.id, 'generate', 1)
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 402 })
    }

    // 5. 调用 AI
    const systemPrompt = getListingPrompt(platform, language)
    const userMessage = JSON.stringify(productInfo)

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })

    const rawContent = completion.choices[0].message.content
    if (!rawContent) {
      return NextResponse.json({ error: 'AI 返回为空，请重试' }, { status: 500 })
    }

    let aiResult
    try {
      aiResult = JSON.parse(rawContent)
      if (!aiResult.title || !Array.isArray(aiResult.bullets) || !aiResult.description) {
        return NextResponse.json({ error: 'AI 返回结构不完整，请重试' }, { status: 500 })
      }
    } catch {
      return NextResponse.json({ error: 'AI 返回格式异常，请重试' }, { status: 500 })
    }

    // 6. 保存记录
    const tokensUsed = completion.usage?.total_tokens || 0
    await supabaseAdmin.from('listings').insert({
      user_id: user.id,
      platform,
      language,
      input_data: productInfo,
      result: aiResult,
      model_used: 'deepseek-chat',
      tokens_used: tokensUsed,
    })

    return NextResponse.json({
      data: aiResult,
      creditsRemaining: creditResult.creditsRemaining,
      creditType: creditResult.type,
      trialRemaining: creditResult.trialRemaining,
    })
  } catch (error: any) {
    console.error('生成接口错误:', error)
    return NextResponse.json({ error: '服务器内部错误，请稍后重试' }, { status: 500 })
  }
}