import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getCompetitorPrompt } from '@/lib/prompts'
import { useCredit, refundCredit } from '@/lib/credits'

const openai = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: process.env.DEEPSEEK_BASE_URL,
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { content, productName, language } = body

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json({ error: '请粘贴竞品 Listing 内容' }, { status: 400 })
    }
    // 语言参数校验
    const validLanguages = ['zh', 'en']
    const lang = validLanguages.includes(language) ? language : 'zh'

    // 认证用户
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未登录' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: '登录已过期，请重新登录' }, { status: 401 })
    }

    // 消费额度
    let creditResult
    try {
      creditResult = await useCredit(user.id, 'competitor', 2)
    } catch (err: any) {
      return NextResponse.json({ error: err.message }, { status: 402 })
    }

    // 生成 Prompt
    const prompt = getCompetitorPrompt(lang, content, productName)

    const completion = await openai.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个资深的跨境电商竞争情报分析专家。请严格按照要求输出。' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 3000,
    })

    const result = completion.choices[0].message.content

    return NextResponse.json({
      result,
      creditsRemaining: creditResult.creditsRemaining,
      creditType: creditResult.type,
      trialRemaining: creditResult.trialRemaining,
    })
  } catch (error: any) {
    console.error('竞品分析出错:', error)
    return NextResponse.json({ error: '分析失败，请稍后重试' }, { status: 500 })
  }
}