'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

const languages = [
  { code: 'en', name: 'English' },
  { code: 'zh', name: '中文' },
]

export default function AuthPage() {
  const t = useTranslations('Auth')
  const router = useRouter()
  const locale = useLocale()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        console.log('注册返回:', data)
        toast.success(t('checkEmail'))
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        console.log('登录返回:', data)
        toast.success(t('loggedIn'))
        router.push('/')
      }
    } catch (error: any) {
      console.error('认证错误:', error)
      toast.error(error.message || t('authFailed'))
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = (newLocale: string) => {
    window.location.href = `/${newLocale}/auth`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center px-4">
      <Card className="w-full max-w-md rounded-2xl border-0 shadow-card bg-white">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-slate-900">
            {isSignUp ? t('signUp') : t('signIn')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">{t('email')}</label>
              <Input
                type="email"
                placeholder="you@example.com"
                className="input-listing"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">{t('password')}</label>
              <Input
                type="password"
                placeholder="••••••••"
                className="input-listing"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-brand-600 hover:underline"
                onClick={() => router.push('/forgot-password')}
              >
                {locale === 'zh' ? '忘记密码？' : 'Forgot password?'}
              </button>
            </div>
            <Button className="btn-primary w-full" disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('processing')}</>
              ) : isSignUp ? t('signUp') : t('signIn')}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            {isSignUp ? t('haveAccount') : t('noAccount')}{' '}
            <button
              type="button"
              className="text-brand-600 hover:underline"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? t('signIn') : t('signUp')}
            </button>
          </p>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <label className="text-sm font-medium text-slate-700 mb-1 block">
              {locale === 'zh' ? '选择语言' : 'Select Language'}
            </label>
            <Select value={locale} onValueChange={handleLanguageChange}>
              <SelectTrigger className="input-listing">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}