import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { creditPlans } from '@/lib/plans'
import { v4 as uuidv4 } from 'uuid'
import axios from 'axios'

export async function POST(req: Request) {
  try {
    // 1. 用户认证
    const authHeader = req.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.split(' ')[1]
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // 2. 获取套餐和价格
    const { planId, locale } = await req.json()
    const plan = creditPlans.find(p => p.id === planId)
    if (!plan) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const planPrice = plan.price[locale === 'zh' ? 'zh' : 'en'] ?? plan.price.en
    const amountInFen = Math.round(planPrice * 100)
    const outTradeNo = `WX${Date.now()}_${uuidv4().slice(0, 8)}`

    // 🔍 日志：检查订单号
    console.log('=== 生成的订单号:', outTradeNo)

    // 3. 在 Supabase 创建订单记录
    const { error: insertError } = await supabaseAdmin
      .from('wechat_orders')
      .insert({
        user_id: user.id,
        plan_id: planId,
        credits: plan.credits,
        amount: amountInFen,
        out_trade_no: outTradeNo,
        status: 'pending'
      })

    if (insertError) {
      console.error('=== 插入订单失败:', insertError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    // 4. 获取微信 access_token
    const appid = process.env.WECHAT_APPID
    const secret = process.env.WECHAT_APPSECRET
    
    console.log('=== 正在获取 access_token...')
    const tokenRes = await axios.get(
      `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`
    )
    const accessToken = tokenRes.data.access_token
    console.log('=== access_token 获取成功')

    // 5. 生成小程序码（携带订单号）
    console.log('=== 即将生成小程序码，订单号:', outTradeNo)
    
    const qrRes = await axios.post(
      `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${accessToken}`,
      {
        scene: outTradeNo,
        page: 'pages/pay/pay',
        width: 280,
        auto_color: false,
        line_color: { r: 37, g: 99, b: 235 }
      },
      { responseType: 'arraybuffer' }
    )

    console.log('=== 小程序码生成结果:', qrRes.status)

    const base64 = Buffer.from(qrRes.data).toString('base64')
    const qrCodeDataUrl = `data:image/png;base64,${base64}`

    return NextResponse.json({
      orderId: outTradeNo,
      qrCode: qrCodeDataUrl,
      amount: amountInFen,
      planName: plan.name[locale === 'zh' ? 'zh' : 'en'] || plan.name.en,
      credits: plan.credits
    })
  } catch (error: any) {
    console.error('=== Create WeChat order error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}