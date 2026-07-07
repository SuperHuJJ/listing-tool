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