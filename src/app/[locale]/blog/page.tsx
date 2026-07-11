'use client'

import { useRouter } from '@/i18n/navigation'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

const articles = {
  zh: [
    {
      title: 'Jungle Scout年费太高，有没有按次付费的平替？',
      date: '2026-07-12',
      slug: 'jungle-scout-alternative',
      excerpt: '做亚马逊的卖家都知道，JS是行业里绕不开的工具。但对于中小卖家来说，它的年费模式是一个不小的负担。有没有真正按需付费的替代方案？',
      tags: ['亚马逊运营', 'AI工具', 'Listing优化'],
    },
  ],
  en: [
    {
      title: 'Jungle Scout Too Expensive? Try This Pay-As-You-Go Alternative',
      date: '2026-07-12',
      slug: 'jungle-scout-alternative',
      excerpt: 'Every Amazon seller knows JS is a must-have tool. But for small and medium sellers, the annual subscription model can be a heavy burden. Is there a real pay-as-you-go alternative?',
      tags: ['Amazon FBA', 'AI Tools', 'Listing Optimization'],
    },
  ],
}

export default function BlogPage() {
  const locale = useLocale()
  const t = articles[locale as keyof typeof articles] || articles.zh
  const router = useRouter()

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: 'linear-gradient(to bottom, #f8fafc, #ffffff)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <Button variant="ghost" size="icon" className="btn-ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">
            {locale === 'zh' ? '博客' : 'Blog'}
          </h1>
        </div>

        <div className="space-y-6">
          {t.map((article, idx) => (
            <div
              key={idx}
              className="card-listing bg-white shadow-sm p-6 cursor-pointer hover:shadow-card-hover transition-shadow"
              onClick={() => router.push(`/blog/${article.slug}`)}
            >
              <h2 className="text-xl font-bold text-slate-900 mb-2">{article.title}</h2>
              <p className="text-sm text-slate-500 mb-3">{article.date}</p>
              <p className="text-slate-600 mb-4">{article.excerpt}</p>
              <div className="flex gap-2">
                {article.tags.map((tag, tagIdx) => (
                  <span key={tagIdx} className="badge">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}