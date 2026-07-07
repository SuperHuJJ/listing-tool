'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'react-hot-toast'
import { Loader2, ArrowLeft, Copy, CheckCircle } from 'lucide-react'

const texts = {
  zh: {
    title: 'Listing 健康评分',
    subtitle: '粘贴你现有的 Listing 内容，AI 会给出详细的评分和优化建议',
    placeholder: '请粘贴完整的 Listing 内容...',
    analyze: '开始评分',
    analyzing: '分析中...',
    loginRequired: '请先登录',
    backToHome: '返回主页',
    results: '评分报告',
    copy: '复制报告',
    copied: '已复制',
    errorEmpty: '请粘贴 Listing 内容',
  },
  en: {
    title: 'Listing Health Score',
    subtitle: 'Paste your existing listing content, AI will give a detailed health score and suggestions',
    placeholder: 'Paste the full listing content...',
    analyze: 'Analyze Score',
    analyzing: 'Analyzing...',
    loginRequired: 'Please login first',
    backToHome: 'Back to Home',
    results: 'Score Report',
    copy: 'Copy Report',
    copied: 'Copied',
    errorEmpty: 'Please paste your listing content',
  },
}

export default function ScorePage() {
  const locale = useLocale()
  const t = texts[locale as keyof typeof texts] || texts.zh
  const router = useRouter()
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  const handleAnalyze = async () => {
    if (!content.trim()) {
      toast.error(t.errorEmpty)
      return
    }
    setLoading(true)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      if (!token) {
        toast.error(t.loginRequired)
        router.push('/auth')
        return
      }
      const res = await fetch('/api/score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, language: locale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data.result)
      toast.success(locale === 'zh' ? '评分完成' : 'Analysis complete')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyAll = () => {
    navigator.clipboard.writeText(result)
    toast.success(t.copied)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <Button variant="ghost" size="icon" className="btn-ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">{t.title}</h1>
        </div>

        <Card className="card-listing bg-white shadow-sm mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-slate-900">{t.title}</CardTitle>
            <p className="text-sm text-slate-500">{t.subtitle}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={t.placeholder}
              className="input-listing min-h-40"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <Button onClick={handleAnalyze} disabled={loading} className="btn-primary w-full">
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.analyzing}</>
              ) : (
                <><CheckCircle className="mr-2 h-4 w-4" /> {t.analyze}</>
              )}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="card-listing bg-white shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-900">{t.results}</CardTitle>
              <Button variant="ghost" size="sm" className="btn-ghost" onClick={copyAll}>
                <Copy className="h-4 w-4 mr-1" /> {t.copy}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="whitespace-pre-wrap text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl">
                {result}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}