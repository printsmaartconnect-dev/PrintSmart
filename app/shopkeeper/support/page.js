'use client'

import { useRouter } from 'next/navigation'
import DashboardHeader from '../dashboard/_components/DashboardHeader'

export default function ShopkeeperSupportPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader shopName="Support" notificationCount={0} />

      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-2xl bg-white shadow-sm border border-slate-200 p-6">
          <h1 className="text-xl font-extrabold text-slate-900">Help &amp; Support</h1>
          <p className="mt-2 text-sm text-slate-600">
            This page is a placeholder. In the next phase, we&apos;ll add the feedback form and customer support contact details here.
          </p>

          <button
            type="button"
            className="mt-6 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700"
            onClick={() => router.back()}
          >
            Go Back
          </button>
        </div>
      </main>
    </div>
  )
}
