'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft } from 'lucide-react';

const texts = {
  zh: {
    title: '找回密码',
    description: '输入你的注册邮箱，我们会发送重置链接',
    email: '邮箱',
    send: '发送重置邮件',
    sending: '发送中...',
    success: '邮件已发送，请检查收件箱并点击链接重置密码',
    backToLogin: '返回登录',
    emptyEmail: '请输入邮箱地址',
  },
  en: {
    title: 'Reset Password',
    description: 'Enter your registered email and we will send you a reset link',
    email: 'Email',
    send: 'Send Reset Email',
    sending: 'Sending...',
    success: 'Email sent. Please check your inbox and click the link to reset your password',
    backToLogin: 'Back to Login',
    emptyEmail: 'Please enter your email address',
  },
};

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const t = texts[locale as keyof typeof texts] || texts.zh;
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error(t.emptyEmail);
      return;
    }

    setLoading(true);
    try {
      const redirectTo = `${window.location.origin}/${locale}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) throw error;
      toast.success(t.success);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="icon" onClick={() => router.push('/auth')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>{t.title}</CardTitle>
          </div>
          <p className="text-sm text-muted-foreground">{t.description}</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendResetEmail} className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t.email}</label>
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.sending}
                </>
              ) : (
                t.send
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}