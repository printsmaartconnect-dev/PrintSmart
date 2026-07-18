'use client'

import { MessageCircle, Youtube } from 'lucide-react'
import useTranslation from '../../src/hooks/useTranslation'

export default function FeedbackButton() {
  const { t } = useTranslation()

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2.5">
      {/* YouTube Button */}
      <a
        href="https://youtube.com/@printsmaartofficialpage?si=XD-Lrvk6d02SXV3X"
        target="_blank"
        rel="noopener noreferrer"
        className="h-10 w-10 flex items-center justify-center rounded-full bg-rose-600 text-white shadow-md hover:bg-rose-700 transition hover:scale-105 active:scale-95"
        title="YouTube Video Guide"
      >
        <Youtube size={18} />
      </a>

      {/* Feedback & Help Button */}
      <a
        href="https://forms.gle/VBK48SwGSWm7prgUA"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg flex items-center gap-2 transition-all hover:scale-110"
        aria-label={t('Feedback & Help')}
      >
        <MessageCircle size={20} />
        <span className="hidden sm:inline text-sm font-semibold">{t('Feedback & Help')}</span>
      </a>
    </div>
  )
}
