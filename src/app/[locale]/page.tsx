'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Loader2,
  Copy,
  Zap,
  Globe,
  Target,
  Lock,
  Search,
  CheckCircle,
  Layers,
  MessageCircle,
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import ListingLockCard from '../../components/ListingLockCard'
import BindPhoneDialog from '../../components/BindPhoneDialog'

const getTrialFeatureInfo = (locale: string) => ({
  generate: { icon: <Zap className="h-4 w-4" />, name: locale === 'zh' ? 'AI 生成' : 'Generate' },
  keywords: { icon: <Search className="h-4 w-4" />, name: locale === 'zh' ? '关键词' : 'Keywords' },
  score: { icon: <CheckCircle className="h-4 w-4" />, name: locale === 'zh' ? '健康评分' : 'Score' },
  competitor: { icon: <Target className="h-4 w-4" />, name: locale === 'zh' ? '竞品分析' : 'Competitor' },
  versions: { icon: <Layers className="h-4 w-4" />, name: locale === 'zh' ? '多版本' : 'Versions' },
})

export default function Home() {
  const t = useTranslations('Home')
  const locale = useLocale()
  const router = useRouter()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [platform, setPlatform] = useState('amazon')
  const [language, setLanguage] = useState('en')
  const [productName, setProductName] = useState('')
  const [features, setFeatures] = useState('')
  const [keywords, setKeywords] = useState('')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [creditsLeft, setCreditsLeft] = useState(0)

  const [phoneVerified, setPhoneVerified] = useState(false)
  const [trialUsage, setTrialUsage] = useState<Record<string, number>>({})
  const [emailConfirmed, setEmailConfirmed] = useState(false)


  useEffect(() => {
    document.title = locale === 'zh'
      ? 'AI Listing生成器 | Amazon/Shopify/eBay文案一键生成'
      : 'AI Listing Generator | Amazon/Shopify/eBay Copywriting Tool'
    }, [locale])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        fetchProfile(session)
        setEmailConfirmed(session.user.email_confirmed_at != null)
      }
      setLoading(false)
    })

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s) {
        fetchProfile(s)
        setEmailConfirmed(s.user.email_confirmed_at != null)
      }
    })
    return () => authListener.subscription.unsubscribe()
  }, [])

  const fetchProfile = async (s: any) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits, phone_verified, trial_usage')
      .eq('id', s.user.id)
      .single()
    if (profile) {
      setCreditsLeft(profile.credits)
      setPhoneVerified(profile.phone_verified || false)
      setTrialUsage(profile.trial_usage || {})
    }
  }

  const handleGenerate = async () => {
    if (!productName || !features || !keywords) {
      toast.error(t('fillAllFields'))
      return
    }
    setGenerating(true)
    try {
      const token = session.access_token
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ platform, language, productInfo: { name: productName, features, keywords } }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || t('generationFailed'))
      setResult(data.data)
      setCreditsLeft(data.creditsRemaining)
      if (data.creditType === 'trial') {
        setTrialUsage(prev => ({ ...prev, generate: data.trialRemaining }))
      }
      toast.success(t('listingGenerated'))
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success(t('copied'))
  }

  const featureInfo = getTrialFeatureInfo(locale)
  const hasTrials = Object.values(trialUsage).some(v => v > 0)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ background: 'linear-gradient(to bottom, #f8fafc, #ffffff)' }}>
        <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
      </div>
    )
  }

  // ========== 未登录 ==========
  if (!session) {
    return (
      <div
        className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(to bottom, #f8fafc, #ffffff)' }}
      >
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, #2563eb20 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 max-w-6xl mx-auto px-4 py-12 lg:py-20 flex flex-col items-center text-center">
          <div className="max-w-2xl">
            <h1 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
              {locale === 'zh' ? 'AI 驱动的跨境 Listing 工作台' : 'AI-Powered Cross-Border Listing Workbench'}
            </h1>
            <p className="text-lg text-slate-500 mb-8 max-w-xl mx-auto">
              {locale === 'zh' ? '从关键词挖掘到竞品分析，再到多版本生成与原创保护，10 倍提升你的跨境文案效率。' : 'From keyword research to competitor analysis, multi-version generation & IP protection. 10x your copy efficiency.'}
            </p>
          </div>
          <div className="w-72 h-auto mb-10 lg:mb-12">
            <svg viewBox="0 0 400 300" fill="none" className="drop-shadow-xl">
              <circle cx="200" cy="130" r="90" fill="#EFF6FF" />
              <circle cx="200" cy="130" r="60" fill="#DBEAFE" />
              <rect x="160" y="100" width="80" height="100" rx="8" fill="white" stroke="#2563EB" strokeWidth="2" />
              <line x1="175" y1="120" x2="225" y2="120" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
              <line x1="175" y1="135" x2="225" y2="135" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
              <line x1="175" y1="150" x2="200" y2="150" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" />
              <circle cx="200" cy="180" r="18" fill="#2563EB" />
              <path d="M192 180 L198 186 L210 174" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="120" cy="80" r="8" fill="#BFDBFE" />
              <circle cx="300" cy="200" r="12" fill="#DBEAFE" />
              <circle cx="280" cy="70" r="6" fill="#EFF6FF" />
            </svg>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mb-12">
            {[
              { icon: <Zap className="h-6 w-6" />, title: locale === 'zh' ? 'AI 秒级生成' : 'AI Generation', desc: locale === 'zh' ? 'DeepSeek 大模型驱动' : 'Powered by DeepSeek' },
              { icon: <Globe className="h-6 w-6" />, title: locale === 'zh' ? '5+ 种语言' : '5+ Languages', desc: locale === 'zh' ? '英/德/日/法/西' : 'EN/DE/JP/FR/ES' },
              { icon: <Target className="h-6 w-6" />, title: locale === 'zh' ? '竞品深度分析' : 'Competitor Analysis', desc: locale === 'zh' ? '找出弱点，超越对手' : 'Spot weaknesses & surpass' },
              { icon: <Lock className="h-6 w-6" />, title: locale === 'zh' ? '原创存证' : 'IP Protection', desc: locale === 'zh' ? 'IPFS + 区块链存证' : 'IPFS + blockchain proof' },
            ].map((item, idx) => (
              <Card key={idx} className="card-listing text-center bg-white/80 backdrop-blur-sm border-slate-200">
                <CardContent className="py-6">
                  <div className="text-brand-600 mb-3 flex justify-center">{item.icon}</div>
                  <h3 className="font-bold text-slate-900 text-base mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4 mb-10">
            <Button className="btn-primary text-lg px-8 py-3 shadow-lg shadow-brand-200" onClick={() => router.push('/auth')}>
              {locale === 'zh' ? '立即免费注册' : 'Get Started Free'}
            </Button>
            <Button className="btn-ghost text-lg px-8 py-3" onClick={() => router.push('/auth')}>
              {locale === 'zh' ? '已有账号？登录' : 'Sign In'}
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-400">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              {locale === 'zh' ? '免信用卡注册' : 'No Credit Card Required'}
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              {locale === 'zh' ? '注册即送 3 次免费生成' : '3 Free Generations on Sign Up'}
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              {locale === 'zh' ? '已服务 2,000+ 卖家' : 'Trusted by 2,000+ sellers'}
            </div>
            <button
              onClick={() => router.push('/contact')}
              className="flex items-center gap-1 text-slate-400 hover:text-brand-600 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              {locale === 'zh' ? '联系我们' : 'Contact'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ========== 已登录 ==========
  return (
    <main
      className="min-h-screen py-10 px-4"
      style={{ background: 'linear-gradient(to bottom, #f8fafc, #ffffff)' }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{t('aiListingTool')}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {t('credits')}: <span className="font-semibold text-slate-700">{creditsLeft}</span>
            </p>
          </div>
          <div className="flex gap-2 items-center flex-wrap">
            {emailConfirmed && !phoneVerified && (
              <BindPhoneDialog
                locale={locale}
                onSuccess={() => {
                  setPhoneVerified(true)
                  fetchProfile(session)
                }}
              />
            )}
            <Button className="btn-primary" onClick={() => router.push('/buy')}>{t('buyCredits')}</Button>
            <Button className="btn-ghost" onClick={() => router.push('/versions')}>{locale === 'zh' ? '多版本' : 'Versions'}</Button>
            <Button className="btn-ghost" onClick={() => router.push('/keywords')}>{locale === 'zh' ? '关键词研究' : 'Keywords'}</Button>
            <Button className="btn-ghost" onClick={() => router.push('/score')}>{locale === 'zh' ? '健康评分' : 'Score Check'}</Button>
            <Button className="btn-ghost" onClick={() => router.push('/competitor')}>{locale === 'zh' ? '竞品分析' : 'Competitor'}</Button>
            <Button className="btn-ghost" onClick={() => router.push('/history')}>{t('history')}</Button>
            <Button className="btn-ghost" onClick={() => router.push('/contact')}>
              <MessageCircle className="w-4 h-4 mr-1" />
              {locale === 'zh' ? '联系我们' : 'Contact'}
            </Button>
            <Button className="btn-ghost text-slate-500 hover:text-slate-700" onClick={async () => { await supabase.auth.signOut(); router.refresh() }}>{t('signOut')}</Button>
          </div>
        </div>

        {hasTrials && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wide">
              {locale === 'zh' ? '免费试用次数' : 'Free Trials'}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {Object.entries(trialUsage).map(([key, remaining]) => {
                if (remaining <= 0) return null
                const info = featureInfo[key as keyof typeof featureInfo]
                if (!info) return null
                return (
                  <Card key={key} className="card-listing flex items-center gap-3 px-4 py-3 shadow-sm bg-white/80 backdrop-blur-sm">
                    <div className="text-brand-600 shrink-0">{info.icon}</div>
                    <div>
                      <p className="text-xs font-medium text-slate-700">{info.name}</p>
                      <p className="text-sm font-bold text-slate-900">{remaining}</p>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: <Zap className="h-6 w-6" />, title: locale === 'zh' ? 'AI 秒级生成' : 'AI Generation', desc: locale === 'zh' ? 'DeepSeek 大模型驱动' : 'Powered by DeepSeek' },
            { icon: <Globe className="h-6 w-6" />, title: locale === 'zh' ? '5+ 目标语言' : '5+ Languages', desc: locale === 'zh' ? '英/德/日/法/西' : 'EN/DE/JP/FR/ES' },
            { icon: <Target className="h-6 w-6" />, title: locale === 'zh' ? '竞品深度分析' : 'Competitor Analysis', desc: locale === 'zh' ? '找出弱点，超越对手' : 'Spot weaknesses & surpass' },
            { icon: <Lock className="h-6 w-6" />, title: locale === 'zh' ? 'Web3 存证' : 'Web3 Proof', desc: locale === 'zh' ? 'IPFS + 链上版权保护' : 'IPFS + blockchain protection' },
          ].map((item, idx) => (
            <Card key={idx} className="card-listing text-center bg-white/90 backdrop-blur-sm">
              <CardContent className="py-4">
                <div className="text-brand-600 mb-3 flex justify-center">{item.icon}</div>
                <h3 className="font-semibold text-slate-900 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-500">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="card-listing bg-white shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold text-slate-900">{t('productDetails')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1 block">{t('platform')}</label>
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
                  <label className="text-sm font-medium text-slate-700 mb-1 block">{t('language')}</label>
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
              <Input placeholder={t('productName')} className="input-listing" value={productName} onChange={e => setProductName(e.target.value)} />
              <Textarea placeholder={t('keyFeatures')} className="input-listing min-h-32" value={features} onChange={e => setFeatures(e.target.value)} />
              <Input placeholder={t('mainKeywords')} className="input-listing" value={keywords} onChange={e => setKeywords(e.target.value)} />
              <Button className="btn-primary w-full" onClick={handleGenerate} disabled={generating}>
                {generating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('generating')}</> : t('generate')}
              </Button>
            </CardContent>
          </Card>

          {result && (
            <div className="space-y-6">
              <Card className="card-listing bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-slate-900">{t('generatedListing')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-slate-700">{t('titleLabel')}</h3>
                      <Button variant="ghost" size="sm" className="h-auto p-1 text-slate-400 hover:text-brand-600" onClick={() => copyToClipboard(result.title)}><Copy className="h-4 w-4" /></Button>
                    </div>
                    <p className="bg-slate-50 p-3 rounded-xl text-sm text-slate-800 mt-1">{result.title}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-2">{t('bulletPoints')}</h3>
                    <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                      {result.bullets?.map((b: string, i: number) => <li key={i}>{b}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-slate-700">{t('description')}</h3>
                      <Button variant="ghost" size="sm" className="h-auto p-1 text-slate-400 hover:text-brand-600" onClick={() => copyToClipboard(result.description)}><Copy className="h-4 w-4" /></Button>
                    </div>
                    <p className="bg-slate-50 p-3 rounded-xl text-sm text-slate-800 mt-1 whitespace-pre-wrap">{result.description}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700">{t('searchTerms')}</h3>
                    <p className="text-sm text-slate-600 mt-1">{result.searchTerms?.join(', ')}</p>
                  </div>
                </CardContent>
              </Card>

              <ListingLockCard
                listingData={result ? {
                  title: result.title,
                  bullets: result.bullets,
                  description: result.description,
                  searchTerms: result.searchTerms,
                  platform,
                  language,
                } : null}
                creditsLeft={creditsLeft}
                setCreditsLeft={setCreditsLeft}
                locale={locale}
              />
            </div>
          )}
        </div>

        {/* 页脚 + 备案号 */}
        <div className="mt-16 text-center text-xs text-slate-400 border-t border-slate-200 pt-8">
          <p>© 2026 AI Listing Tool. All rights reserved.</p>
          <p className="mt-1">
            <a
              href="http://beian.miit.gov.cn"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-500"
            >
              渝ICP备2026010296号-1  {/* 渝ICP备2026010296号-1 */}
            </a>
          </p>
        </div>
      </div>
    </main>
  )
}