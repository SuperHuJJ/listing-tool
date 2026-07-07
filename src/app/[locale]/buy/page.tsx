'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { supabase } from '@/lib/supabase/client'
import { creditPlans } from '@/lib/plans'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'react-hot-toast'
import { Loader2, ArrowLeft, Zap, TrendingUp, Shield } from 'lucide-react'
import Image from 'next/image'

const texts: Record<string, any> = {
  zh: {
    title: '积分兑换',
    subtitle: '专业 AI 工具，即刻提升跨境 Listing 效率',
    benefits: [
      { icon: <Zap className="h-5 w-5" />, text: '比手写快 100 倍，DeepSeek 专业调校' },
      { icon: <TrendingUp className="h-5 w-5" />, text: '包含竞品分析 + 关键词挖掘 + 多版本对比' },
      { icon: <Shield className="h-5 w-5" />, text: '独家 IPFS 原创存证，版权保护' },
    ],
    buyNow: '立即获取',
    loading: '生成中...',
    loginRequired: '请先登录',
    backToHome: '返回主页',
    popular: '🔥 最受欢迎',
    perCredit: '/额度',
    scanTitle: '微信扫码获取额度',
    scanDesc: '请使用微信扫一扫',
    cancel: '取消',
    success: '额度已到账！',
  },
  en: {
    title: 'Credit Exchange',
    subtitle: 'Professional AI tool to boost your cross-border listing efficiency',
    benefits: [
      { icon: <Zap className="h-5 w-5" />, text: '100x faster than manual, tuned with DeepSeek' },
      { icon: <TrendingUp className="h-5 w-5" />, text: 'Includes competitor analysis + keyword research + multi-version' },
      { icon: <Shield className="h-5 w-5" />, text: 'Exclusive IPFS proof for copyright protection' },
    ],
    buyNow: 'Get Now',
    loading: 'Processing...',
    loginRequired: 'Please login first',
    backToHome: 'Back to Home',
    popular: '🔥 Most Popular',
    perCredit: '/credit',
    scanTitle: 'Scan with WeChat',
    scanDesc: 'Please scan with WeChat',
    cancel: 'Cancel',
    success: 'Credits added!',
  },
}

export default function BuyCreditsPage() {
  const locale = useLocale()
  const t = texts[locale] || texts.zh
  const router = useRouter()
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null)
  const pollingRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const handleBuy = async (planId: string) => {
    setLoadingPlan(planId)
    try {
      const session = await supabase.auth.getSession()
      const token = session.data.session?.access_token
      if (!token) {
        toast.error(t.loginRequired)
        router.push('/auth')
        return
      }
      const res = await fetch('/api/create-wechat-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId, locale }),
      })
      const data = await res.json()
      if (data.qrCode) {
        setQrCode(data.qrCode)
        setCurrentOrderId(data.orderId)
        startPolling(data.orderId)
      } else {
        toast.error(data.error || '创建订单失败')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoadingPlan(null)
    }
  }

  const startPolling = (orderId: string) => {
    pollingRef.current = setInterval(async () => {
      const res = await fetch(`/api/order-status?orderId=${orderId}`)
      const data = await res.json()
      if (data.status === 'paid') {
        clearInterval(pollingRef.current)
        toast.success(t.success)
        setQrCode(null)
        router.refresh()
      }
    }, 3000)
  }

  useEffect(() => {
    return () => clearInterval(pollingRef.current)
  }, [])

  const currencySymbol = locale === 'zh' ? '¥' : '$'

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'linear-gradient(to bottom, #f8fafc, #ffffff)' }}>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" className="btn-ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">{t.title}</h1>
        </div>

        <p className="text-lg text-slate-500 mb-6">{t.subtitle}</p>
        <div className="flex flex-wrap gap-6 mb-10">
          {t.benefits.map((b: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 text-sm text-slate-600 bg-white px-4 py-2 rounded-xl shadow-card">
              <span className="text-brand-600">{b.icon}</span>
              <span>{b.text}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {creditPlans.map((plan) => {
            const isPopular = plan.popular
            const planName = plan.name[locale as 'zh' | 'en'] || plan.name.en
            const planPrice = plan.price[locale as 'zh' | 'en'] ?? plan.price.en
            const perCreditPrice = (planPrice / plan.credits).toFixed(2)

            return (
              <Card
                key={plan.id}
                className={`relative card-listing h-full flex flex-col ${isPopular ? 'ring-2 ring-brand-500 shadow-lg' : ''}`}
                style={{ overflow: 'visible' }}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
                    <span className="bg-brand-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow whitespace-nowrap">
                      {t.popular}
                    </span>
                  </div>
                )}
                <CardHeader className={isPopular ? 'pt-6' : ''}>
                  <CardTitle className="text-xl font-bold text-slate-900">{planName}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center text-center space-y-3 flex-1">
                  <div className="text-4xl font-extrabold text-slate-900">
                    {currencySymbol}{planPrice}
                  </div>
                  <div className="text-slate-500 text-sm">
                    {plan.credits} 额度 · {currencySymbol}{perCreditPrice}{t.perCredit}
                  </div>
                  <div className="flex-1" />
                  <Button
                    className={`w-full ${isPopular ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => handleBuy(plan.id)}
                    disabled={loadingPlan === plan.id}
                  >
                    {loadingPlan === plan.id ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.loading}</>
                    ) : (
                      t.buyNow
                    )}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* 小程序码弹窗 */}
        {qrCode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-2xl shadow-card text-center">
              <h2 className="text-xl font-bold mb-4">{t.scanTitle}</h2>
              <Image src={qrCode} alt="QR Code" width={200} height={200} className="mx-auto" />
              <p className="text-sm text-slate-500 mt-2">{t.scanDesc}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setQrCode(null)
                  clearInterval(pollingRef.current)
                }}
              >
                {t.cancel}
              </Button>
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <Button className="btn-ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" /> {t.backToHome}
          </Button>
        </div>
      </div>
    </div>
  )
}