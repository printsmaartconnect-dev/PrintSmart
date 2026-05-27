'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import DashboardHeader from '../dashboard/_components/DashboardHeader'

export default function ShopkeeperSupportPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader shopName="Support" notificationCount={0} />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-gray-200 bg-white text-gray-800 hover:bg-slate-50 transition"
              aria-label="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-xl font-extrabold text-slate-900">Help &amp; Support</h1>
          </div>
          <p className="text-sm text-slate-600">
            This page is a placeholder. In the next phase, we&apos;ll add the feedback form and customer support contact details here.
          </p>
        </div>
      </main>
    </div>
  )
}
