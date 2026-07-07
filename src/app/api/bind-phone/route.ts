import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

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

    const { phone, turnstileToken } = await req.json();

    if (!phone) {
      return NextResponse.json({ error: 'Phone number required' }, { status: 400 });
    }

    // 验证 Turnstile 人机验证 token
    if (!turnstileToken) {
      return NextResponse.json({ error: '人机验证失败，请刷新页面重试' }, { status: 400 });
    }

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    });

    const verifyData = await verifyRes.json();
    if (!verifyData.success) {
      return NextResponse.json({ error: '人机验证未通过，请重试' }, { status: 400 });
    }

    // 查重：该手机号是否已被其他账号绑定
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existing) {
      return NextResponse.json({ error: '该手机号已被其他账号绑定' }, { status: 409 });
    }

    // 首次绑定手机号才赠送试用次数
    const initialTrialUsage = {
      generate: 2,
      keywords: 2,
      score: 2,
      competitor: 2,
      versions: 2,
    };

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        phone,
        phone_verified: true,
        trial_usage: initialTrialUsage,
      })
      .eq('id', user.id);

    if (updateError) {
      // 如果并发时出现唯一约束冲突
      if (updateError.code === '23505') {
        return NextResponse.json({ error: '该手机号已被其他账号绑定' }, { status: 409 });
      }
      return NextResponse.json({ error: 'Failed to bind phone' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Phone verified and trials granted' });
  } catch (error: any) {
    console.error('Bind phone error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}