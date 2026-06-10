import { Suspense } from 'react'
import CustomerReviewContent from './CustomerReviewContent'

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <CustomerReviewContent />
    </Suspense>
  )
}