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
  return {
    title: {
      default: locale === 'zh' ? 'AI Listing Tool - 跨境电商AI文案生成器' : 'AI Listing Tool - Cross-Border AI Listing Generator',
      template: '%s | AI Listing Tool'
    },
    description: locale === 'zh'
      ? 'AI驱动的跨境Listing生成工具，支持Amazon/Shopify/eBay多平台，一键生成高质量产品标题、五点描述、搜索词，10倍提升文案效率。'
      : 'AI-powered cross-border listing generator. Supports Amazon/Shopify/eBay. Generate high-quality titles, bullet points, descriptions, and search terms in seconds.',
    keywords: 'AI Listing生成, Amazon文案, 跨境电商工具, Listing优化, 关键词研究, 竞品分析, AI Listing Generator, Amazon copywriting, cross-border ecommerce, listing optimization',
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