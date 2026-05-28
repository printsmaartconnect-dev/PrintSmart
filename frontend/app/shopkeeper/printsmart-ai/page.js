'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import DashboardHeader from '../dashboard/_components/DashboardHeader'
import BottomDock from '../dashboard/_components/BottomDock'
import { bottomDockItems } from '../dashboard/_components/mockData'

const aiImageCandidates = [
  '/printsmart_ai.png',
  '/printsmart_ai.jpg',
  '/printsmart-ai.png',
  '/printsmart-ai.jpg',
]

export default function PrintSmartAiPage() {
  const router = useRouter()
  const [shopName, setShopName] = useState('')
  const [imageIndex, setImageIndex] = useState(0)

  useEffect(() => {
    const loggedIn = localStorage.getItem('loggedInShopkeeper')
    if (!loggedIn) {
      router.replace('/shopkeeper/login')
      return
    }

    try {
      const account = JSON.parse(localStorage.getItem('shopkeeper') || 'null')
      if (account?.shopName) {
        setShopName(account.shopName)
      }
    } catch {
      // Keep default header state if local storage payload is malformed.
    }
  }, [router])

  const handleImageError = () => {
    setImageIndex((prev) => prev + 1)
  }

  const hasValidImage = imageIndex < aiImageCandidates.length
  const imageSrc = hasValidImage ? aiImageCandidates[imageIndex] : null

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader shopName={shopName || 'PrintSmart AI'} />

      <main className="px-4 sm:px-6 lg:px-8 pb-28 pt-4">
        <div className="mx-auto max-w-7xl rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-6 shadow-sm">
          {hasValidImage ? (
            <img
              src={imageSrc}
              alt="PrintSmart AI features"
              className="h-auto w-full rounded-xl object-contain"
              onError={handleImageError}
            />
          ) : (
            <div className="flex min-h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-600">
              Add your design image to public as printsmart_ai.png (or .jpg).
            </div>
          )}
        </div>
      </main>

      <BottomDock items={bottomDockItems} />
    </div>
  )
}
