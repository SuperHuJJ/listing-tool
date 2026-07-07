import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orderNo = searchParams.get('orderNo')
  if (!orderNo) return NextResponse.json({ error: '缺少订单号' }, { status: 400 })

  const { data: order, error } = await supabaseAdmin
    .from('wechat_orders')
    .select('*')
    .eq('out_trade_no', orderNo)
    .single()

  if (error || !order) return NextResponse.json({ error: '订单不存在' }, { status: 404 })

  return NextResponse.json({
    orderNo: order.out_trade_no,
    credits: order.credits,
    amount: order.amount,
    planName: order.plan_id,
    status: order.status
  })
}