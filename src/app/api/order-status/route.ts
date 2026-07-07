import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const orderId = searchParams.get('orderId')
  if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 })

  const { data: order, error } = await supabaseAdmin
    .from('wechat_orders')
    .select('status')
    .eq('out_trade_no', orderId)
    .single()

  if (error || !order) return NextResponse.json({ status: 'pending' })
  return NextResponse.json({ status: order.status })
}