import { NextIntlClientProvider } from 'next-intl'
import { notFound } from 'next/navigation'
import { Inter } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import '../globals.css'

import enMessages from '../../../messages/en.json'
import zhMessages from '../../../messages/zh.json'

const inter = Inter({ subsets: ['latin'] })
const locales = ['en', 'zh']

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isZh = locale === 'zh'

  return {
    title: {
      default: isZh ? 'AI Listing生成器 | Amazon/Shopify/eBay文案一键生成' : 'AI Listing Generator | Amazon/Shopify/eBay Copywriting Tool',
      template: '%s | AI Listing Tool'
    },
    description: isZh
      ? 'AI驱动的跨境Listing生成工具，支持Amazon/Shopify/eBay多平台，一键生成高质量产品标题、五点描述、搜索词，10倍提升文案效率。同时提供关键词研究、竞品分析、健康评分、多版本对比等功能。'
      : 'AI-powered cross-border listing generator. Supports Amazon/Shopify/eBay. Generate high-quality titles, bullet points, descriptions, and search terms in seconds. Also provides keyword research, competitor analysis, health scoring, and multi-version comparison.',
    keywords: 'AI Listing生成, Amazon文案, 跨境电商工具, Listing优化, 关键词研究, 竞品分析, 健康评分, 多版本生成, AI Listing Generator, Amazon copywriting, cross-border ecommerce, listing optimization, keyword research, competitor analysis',
    other: {
      'baidu-site-verification': 'codeva-3Vt49D6Bp3',
      'google-site-verification': 'googleaeeb30f50256d0a7',
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!locales.includes(locale)) notFound()

  const messages = locale === 'en' ? enMessages : zhMessages

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className={inter.className}>
        {children}
        <Toaster position="top-center" />
      </div>
    </NextIntlClientProvider>
  )
}