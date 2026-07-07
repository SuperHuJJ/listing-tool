import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();
    if (!message || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    let userId: string | null = null;
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const { data: { user } } = await supabaseAdmin.auth.getUser(token);
      if (user) userId = user.id;
    }

    const { error } = await supabaseAdmin.from('feedback').insert({
      user_id: userId,
      name: name || null,
      email: email || null,
      message,
    });

    if (error) {
      return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Feedback error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}