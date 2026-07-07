'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useWeb3Lock } from '@/hooks/useWeb3Lock'
import { Loader2, Lock, CheckCircle, ExternalLink } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface Props {
  listingData: {
    title: string
    bullets: string[]
    description: string
    searchTerms: string[]
    platform: string
    language: string
  } | null
  creditsLeft: number
  setCreditsLeft: (value: number | ((prev: number) => number)) => void
  locale: string
}

export default function ListingLockCard({ listingData, locale, creditsLeft, setCreditsLeft }: Props) {
  const { ipfsCid, loading, lockListing } = useWeb3Lock()

  const t = {
    title: locale === 'zh' ? '📎 IPFS 原创存证' : '📎 IPFS Proof',
    info: locale === 'zh'
      ? '将 Listing 上传 IPFS 并获得永久链接与时间戳，作为原创证明'
      : 'Upload listing to IPFS and get a permanent link with timestamp proof',
    lock: locale === 'zh' ? '立即存证（消耗 1 积分）' : 'Lock Now (1 credit)',
    locking: locale === 'zh' ? '存证中...' : 'Locking...',
    success: locale === 'zh' ? '存证成功！' : 'Locked Successfully!',
    viewOnIpfs: locale === 'zh' ? '查看 IPFS 文件' : 'View on IPFS',
    insufficient: locale === 'zh' ? '积分不足' : 'Not enough credits',
  }

  if (!listingData) return null

  const handleLock = async () => {
    if (creditsLeft < 1) {
      toast.error(t.insufficient)
      return
    }
    try {
      await lockListing(listingData)
      toast.success(t.success)
      setCreditsLeft((prev: number) => prev - 1)
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Card className="mt-6 border border-blue-100 bg-blue-50/50 shadow-none">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold text-blue-900 flex items-center gap-2">
          <Lock className="h-5 w-5 text-brand-600" />
          {t.title}
        </CardTitle>
        <p className="text-sm text-blue-700">{t.info}</p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <Button
          className="btn-primary w-full"
          onClick={handleLock}
          disabled={loading || creditsLeft < 1}
        >
          {loading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t.locking}</>
          ) : (
            <><Lock className="mr-2 h-4 w-4" /> {t.lock}</>
          )}
        </Button>
        {ipfsCid && (
          <div className="text-sm text-green-700 bg-green-50 p-3 rounded-xl flex flex-wrap items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
            <span className="font-medium">{t.success}</span>
            <a
              href={`https://crimson-select-flyingfish-883.mypinata.cloud/ipfs/${ipfsCid}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto text-brand-600 hover:underline inline-flex items-center gap-1"
            >
              {t.viewOnIpfs} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}