'use client'

import { useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import { Loader2, ArrowLeft, Copy, Target } from 'lucide-react'

const texts = {
  zh: {
    title: '竞品分析',
    subtitle: '粘贴竞品的 Listing 内容，AI 将分析其优劣势并生成优化版',
    placeholder: '请粘贴竞品的完整 Listing 内容...',
    productName: '你的产品名称（可选）',
    productNamePlaceholder: '如：无线蓝牙耳机',
    analyze: '开始分析',
    analyzing: '分析中...',
    loginRequired: '请先登录',
    backToHome: '返回主页',
    results: '分析报告',
    copy: '复制报告',
    copied: '已复制',
    errorEmpty: '请粘贴竞品 Listing 内容',
  },
  en: {
    title: 'Competitor Analysis',
    subtitle: 'Paste competitor listing content, AI will analyze strengths & weaknesses and generate an optimized version',
    placeholder: 'Paste the full competitor listing...',
    productName: 'Your product name (optional)',
    productNamePlaceholder: 'e.g. Wireless Bluetooth Headphones',
    analyze: 'Analyze & Generate',
    analyzing: 'Analyzing...',
    loginRequired: 'Please login first',
    backToHome: 'Back to Home',
    results: 'Analysis Report',
    copy: 'Copy Report',
    copied: 'Copied',
    errorEmpty: 'Please paste competitor listing content',
  },
}

export default function CompetitorPage() {
  const locale = useLocale()
  const t = texts[locale as keyof typeof texts] || texts.zh
  const router = useRouter()
  const [content, setContent] = useState('')
  const [productName, setProductName] = useState('')
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
      const res = await fetch('/api/competitor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, productName, language: locale }),
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
            <p className="text-sm text-slate-500">{t.subtitle}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder={t.productNamePlaceholder}
              className="input-listing"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
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
                <><Target className="mr-2 h-4 w-4" /> {t.analyze}</>
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