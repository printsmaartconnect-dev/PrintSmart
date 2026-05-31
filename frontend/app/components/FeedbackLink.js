'use client'

import React from 'react'
import useTranslation from '../../src/hooks/useTranslation'

export default function FeedbackLink() {
  const { t } = useTranslation()

  return (
    <div className="flex justify-center mt-4 pb-2">
      <a
        href="https://forms.gle/VBK48SwGSWm7prgUA"
        target="_blank"
        rel="noopener noreferrer"
        className="text-indigo-600 hover:text-indigo-800 hover:underline text-sm font-semibold transition flex items-center gap-1"
      >
        {t('Need Help? Contact Support & Feedback →')}
      </a>
    </div>
  )
}
