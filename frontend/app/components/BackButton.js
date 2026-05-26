'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ className = '' }) {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className={`flex items-center gap-2 text-gray-700 hover:text-indigo-600 transition-colors font-medium ${className}`}
      aria-label="Go back"
    >
      <ArrowLeft size={18} />
      <span>Go Back</span>
    </button>
  )
}
