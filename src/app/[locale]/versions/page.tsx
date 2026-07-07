'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'react-hot-toast'
import { Loader2, ArrowLeft, Copy, Layers } from 'lucide-react'

const texts = {
  zh: {
    title: '多版本对比生成',
    subtitle: '输入产品信息，AI 将生成 3 种不同风格的高质量 Listing',
    productName: '产品名称',
    productNamePlaceholder: '如：无线蓝牙耳机',
    features: '主要特点（每行一个）',
    featuresPlaceholder: '如：\n主动降噪\n30小时续航\n可折叠设计',
    keywords: '核心关键词（逗号分隔）',
    keywordsPlaceholder: '如：蓝牙耳机, 降噪耳机',
    platform: '目标平台',
    language: 'Listing 语言',
    generate: '生成 3 个版本',
    generating: 'AI 正在为你创作 3 个版本...',
    loginRequired: '请先登录',
    versionNames: ['专业规范型', '营销情感型', 'SEO 极简型'],
    versionDescs: ['适合大多数品类，专业、全面、可信赖', '适合礼品、时尚品类，激发购买欲', '适合标品、工具类，简洁高效抓眼球'],
    copyThis: '复制此版本',
    copied: '已复制',
    fillAllFields: '请填写所有字段',
    generationFailed: '生成失败',
    creditsLeft: '剩余积分',
    titleLabel: '标题',
    bulletPoints: '五点描述',
    description: '描述',
    searchTerms: '搜索词',
  },
  en: {
    title: 'Multi-Version Generator',
    subtitle: 'Enter product info, AI will generate 3 different styles of high-quality listings',
    productName: 'Product Name',
    productNamePlaceholder: 'e.g. Wireless Bluetooth Headphones',
    features: 'Key Features (one per line)',
    featuresPlaceholder: 'e.g.\nActive noise cancelling\n30h battery\nFoldable design',
    keywords: 'Core Keywords (comma separated)',
    keywordsPlaceholder: 'e.g. bluetooth headphones, noise cancelling',
    platform: 'Target Platform',
    language: 'Listing Language',
    generate: 'Generate 3 Versions',
    generating: 'AI is creating 3 versions...',
    loginRequired: 'Please login first',
    versionNames: ['Professional', 'Emotional Marketing', 'SEO Minimalist'],
    versionDescs: ['Best for most categories', 'Best for gifts & fashion', 'Best for tools & commodities'],
    copyThis: 'Copy This Version',
    copied: 'Copied',
    fillAllFields: 'Please fill all fields',
    generationFailed: 'Generation failed',
    creditsLeft: 'Credits',
    titleLabel: 'Title',
    bulletPoints: 'Bullet Points',
    description: 'Description',
    searchTerms: 'Search Terms',
  },
}

interface VersionResult {
  title: string
  bullets: string[]
  description: string
  searchTerms: string[]
}

export default function VersionsPage() {
  const locale = useLocale()
  const t = texts[locale as keyof typeof texts] || texts.zh
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [creditsLeft, setCreditsLeft] = useState(0)
  const [platform, setPlatform] = useState('amazon')
  const [language, setLanguage] = useState('en')
  const [productName, setProductName] = useState('')
  const [features, setFeatures] = useState('')
  const [keywords, setKeywords] = useState('')
  const [generating, setGenerating] = useState(false)
  const [results, setResults] = useState<VersionResult[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session)
      setLoading(false)
    })
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s) fetchProfile(s)
    })
    return () => authListener.subscription.unsubscribe()
  }, [])

  const fetchProfile = async (s: any) => {
    const { data: profile } = await supabase.from('profiles').select('credits').eq('id', s.user.id).single()
    if (profile) setCreditsLeft(profile.credits)
  }

  const handleGenerate = async () => {
    if (!productName || !features || !keywords) {
      toast.error(t.fillAllFields)
      return
    }
    setGenerating(true)
    setResults([])
    try {
      const token = session.access_token
      const res = await fetch('/api/versions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ platform, language, productInfo: { name: productName, features, keywords } }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t.generationFailed)
      setResults(data.data)
      if (data.creditsRemaining !== undefined) setCreditsLeft(data.creditsRemaining)
      toast.success(locale === 'zh' ? '3 个版本已生成' : '3 versions generated')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setGenerating(false)
    }
  }

  const copyVersion = (version: VersionResult) => {
    const text = `Title: ${version.title}\n\nBullet Points:\n${version.bullets.map((b, i) => `${i + 1}. ${b}`).join('\n')}\n\nDescription:\n${version.description}\n\nSearch Terms: ${version.searchTerms.join(', ')}`
    navigator.clipboard.writeText(text)
    toast.success(t.copied)
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
    </div>
  )
  if (!session) return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-bold text-slate-900">{t.title}</h1>
      <p className="text-slate-500">{t.subtitle}</p>
      <Button className="btn-primary" onClick={() => router.push('/auth')}>{locale === 'zh' ? '登录' : 'Sign In'}</Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="btn-ghost" onClick={() => router.push('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{t.title}</h1>
              <p className="text-sm text-slate-500">{t.creditsLeft}: {creditsLeft}</p>
            </div>
          </div>
        </div>

        <Card className="card-listing bg-white shadow-sm mb-8">
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">{t.platform}</label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="input-listing"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="amazon">Amazon</SelectItem>
                    <SelectItem value="shopify">Shopify</SelectItem>
                    <SelectItem value="ebay">eBay</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1 block">{t.language}</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger className="input-listing"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="ja">Japanese</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Input placeholder={t.productNamePlaceholder} className="input-listing" value={productName} onChange={e => setProductName(e.target.value)} />
            <Textarea placeholder={t.featuresPlaceholder} className="input-listing min-h-32" value={features} onChange={e => setFeatures(e.target.value)} />
            <Input placeholder={t.keywordsPlaceholder} className="input-listing" value={keywords} onChange={e => setKeywords(e.target.value)} />
            <Button className="btn-primary w-full" onClick={handleGenerate} disabled={generating}>
              {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.generating}</> : <><Layers className="mr-2 h-4 w-4" /> {t.generate}</>}
            </Button>
          </CardContent>
        </Card>

        {results.length === 3 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {results.map((version, idx) => (
              <Card key={idx} className="card-listing bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900">{t.versionNames[idx]}</CardTitle>
                  <p className="text-xs text-slate-500">{t.versionDescs[idx]}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold mb-1">{t.titleLabel}</h4>
                    <p className="text-sm bg-slate-50 p-2 rounded-xl">{version.title}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">{t.bulletPoints}</h4>
                    <ul className="list-disc pl-4 text-sm space-y-1">
                      {version.bullets.map((b, i) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">{t.description}</h4>
                    <p className="text-sm bg-slate-50 p-2 rounded-xl whitespace-pre-wrap">{version.description}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-1">{t.searchTerms}</h4>
                    <p className="text-sm">{version.searchTerms.join(', ')}</p>
                  </div>
                  <Button variant="outline" size="sm" className="btn-ghost w-full" onClick={() => copyVersion(version)}>
                    <Copy className="h-4 w-4 mr-2" /> {t.copyThis}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}