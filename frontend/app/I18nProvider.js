'use client'

import '../lib/i18n'
import { useEffect } from 'react'
import { I18nextProvider } from 'react-i18next'
import i18n from '../lib/i18n'

export default function I18nProvider({ children }) {
  useEffect(() => {
    // Sync language from localStorage on client side mount
    const saved = localStorage.getItem('customerLanguage')
    if (saved && i18n.language !== saved) {
      i18n.changeLanguage(saved)
    }
  }, [])

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
}
