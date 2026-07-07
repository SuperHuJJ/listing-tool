'use client';

import { useState, useEffect } from 'react';
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
    title: '设置新密码',
    description: '请输入你的新密码',
    password: '新密码',
    confirmPassword: '确认密码',
    submit: '重置密码',
    submitting: '提交中...',
    success: '密码已重置，请重新登录',
    passwordMismatch: '两次输入的密码不一致',
    emptyPassword: '密码不能为空',
    backToLogin: '返回登录',
  },
  en: {
    title: 'Set New Password',
    description: 'Enter your new password',
    password: 'New Password',
    confirmPassword: 'Confirm Password',
    submit: 'Reset Password',
    submitting: 'Submitting...',
    success: 'Password has been reset. Please login again.',
    passwordMismatch: 'Passwords do not match',
    emptyPassword: 'Password cannot be empty',
    backToLogin: 'Back to Login',
  },
};

export default function ResetPasswordPage() {
  const locale = useLocale();
  const t = texts[locale as keyof typeof texts] || texts.zh;
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // 恢复 session（点击邮件链接后 Supabase 会自动设置 session，但可能还没 ready）
  useEffect(() => {
    // 监听 auth 状态变化，如果用户从邮件链接过来，session 会被设置
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // 什么都不用做，只要 session 存在即可
      }
    );
    return () => authListener.subscription.unsubscribe();
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error(t.emptyPassword);
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t.passwordMismatch);
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });
      if (error) throw error;
      toast.success(t.success);
      // 清除 session 让用户重新登录
      await supabase.auth.signOut();
      router.push('/auth');
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
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-sm font-medium">{t.password}</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">{t.confirmPassword}</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                t.submit
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}