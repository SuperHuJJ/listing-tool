'use client'

import { useState } from 'react'
import { uploadListingToIPFS } from '@/lib/web3/ipfs'

export function useWeb3Lock() {
  const [ipfsCid, setIpfsCid] = useState('')
  const [loading, setLoading] = useState(false)

  const lockListing = async (listingData: {
    title: string
    bullets: string[]
    description: string
    searchTerms: string[]
    platform: string
    language: string
  }) => {
    setLoading(true)
    setIpfsCid('')
    try {
      const cid = await uploadListingToIPFS({
        ...listingData,
        timestamp: new Date().toISOString(),
      })
      setIpfsCid(cid)
    } catch (error: any) {
      throw new Error(error.message || 'IPFS upload failed')
    } finally {
      setLoading(false)
    }
  }

  return { ipfsCid, loading, lockListing }
}