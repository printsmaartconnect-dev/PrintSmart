'use client'

import { MessageCircle } from 'lucide-react'
import useTranslation from '../../src/hooks/useTranslation'

export default function FeedbackButton() {
  const { t } = useTranslation()

  return (
    <a
      href="https://forms.gle/VBK48SwGSWm7prgUA"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg flex items-center gap-2 transition-all hover:scale-110"
      aria-label={t('Feedback & Help')}
    >
      <MessageCircle size={20} />
      <span className="hidden sm:inline text-sm font-semibold">{t('Feedback & Help')}</span>
    </a>
  )
}
