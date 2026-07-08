'use client'

import { useState, useEffect } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import { Loader2, ArrowLeft, Copy, Search } from 'lucide-react'

const texts = {
  zh: {
    title: '关键词研究',
    placeholder: '输入核心关键词，如 "bluetooth headphones"',
    generate: '生成建议',
    generating: '分析中...',
    loginRequired: '请先登录',
    backToHome: '返回主页',
    results: '分析结果',
    copy: '复制全部',
    copied: '已复制',
    errorEmpty: '请输入关键词',
  },
  en: {
    title: 'Keyword Research',
    placeholder: 'Enter a core keyword, e.g. "bluetooth headphones"',
    generate: 'Generate Ideas',
    generating: 'Analyzing...',
    loginRequired: 'Please login first',
    backToHome: 'Back to Home',
    results: 'Results',
    copy: 'Copy All',
    copied: 'Copied',
    errorEmpty: 'Please enter a keyword',
  },
}

export default function KeywordsPage() {
  const locale = useLocale()
  const t = texts[locale as keyof typeof texts] || texts.zh
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string>('')

  // ===== 新增：SEO 标题 =====
  useEffect(() => {
    document.title = locale === 'zh'
      ? 'Amazon关键词研究工具 | 长尾词挖掘与竞争度分析'
      : 'Amazon Keyword Research Tool | Long-tail Keywords & Competition Analysis'
  }, [locale])
  // ===== 新增结束 =====

  const handleResearch = async () => {
    if (!keyword.trim()) {
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
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ keyword, language: locale }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data.result)
      toast.success(locale === 'zh' ? '分析完成' : 'Analysis complete')
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
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder={t.placeholder}
                className="input-listing pl-10"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>
            <Button onClick={handleResearch} disabled={loading} className="btn-primary w-full">
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.generating}</>
              ) : (
                t.generate
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