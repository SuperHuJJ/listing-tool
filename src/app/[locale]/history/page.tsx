'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { useTranslations } from 'next-intl'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDistanceToNow } from 'date-fns'
import { Loader2, ArrowLeft, Clock } from 'lucide-react'

export default function HistoryPage() {
  const t = useTranslations('History')
  const router = useRouter()
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [])

  const fetchHistory = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.push('/auth'); return }
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setListings(data || [])
    setLoading(false)
  }

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-10">
          <Button variant="ghost" size="icon" className="btn-ghost" onClick={() => router.push('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-3xl font-bold text-slate-900">{t('title')}</h1>
        </div>
        {listings.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Clock className="h-12 w-12 mx-auto mb-4 text-slate-300" />
            <p>{t('noListings')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((item) => (
              <Card key={item.id} className="card-listing bg-white shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold text-slate-900">
                      {item.input_data?.name || t('untitled')}
                    </CardTitle>
                    <span className="text-sm text-slate-400">
                      {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{item.platform} · {item.language}</p>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-2">
                    <p><strong className="text-slate-700">{t('titleLabel')}:</strong> {item.result?.title}</p>
                    <details className="text-sm">
                      <summary className="cursor-pointer text-brand-600 font-medium">{t('viewDetails')}</summary>
                      <div className="mt-2 space-y-2 bg-slate-50 p-3 rounded-xl">
                        <div><strong className="text-slate-700">{t('bulletPoints')}:</strong>
                          <ul className="list-disc pl-4">
                            {item.result?.bullets?.map((b: string, i: number) => <li key={i}>{b}</li>)}
                          </ul>
                        </div>
                        <p><strong className="text-slate-700">{t('description')}:</strong> {item.result?.description}</p>
                        <p><strong className="text-slate-700">{t('searchTerms')}:</strong> {item.result?.searchTerms?.join(', ')}</p>
                      </div>
                    </details>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}