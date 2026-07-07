const PINATA_JWT = process.env.NEXT_PUBLIC_PINATA_JWT!

export async function uploadListingToIPFS(listingData: {
  title: string
  bullets: string[]
  description: string
  searchTerms: string[]
  platform: string
  language: string
  timestamp: string
}): Promise<string> {
  const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: JSON.stringify({
      pinataContent: listingData,
      pinataMetadata: {
        name: `listing-${listingData.timestamp}`,
      },
    }),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`IPFS upload failed: ${err}`)
  }
  const data = await res.json()
  return data.IpfsHash
}