'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  defaultLanguage,
  normalizeLanguage,
  translate,
} from '../lib/translations'

const LANGUAGE_STORAGE_KEY = 'language'
const LEGACY_LANGUAGE_STORAGE_KEY = 'customerLanguage'
const LANGUAGE_EVENT = 'printsmart-language-change'

function getInitialLanguage() {
  if (typeof window === 'undefined') {
    return defaultLanguage
  }

  const storedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY)
  if (storedLanguage) return normalizeLanguage(storedLanguage)

  const legacyLanguage = localStorage.getItem(LEGACY_LANGUAGE_STORAGE_KEY)
  if (legacyLanguage) return normalizeLanguage(legacyLanguage)

  return defaultLanguage
}

export default function useTranslation() {
  const [language, setLanguageState] = useState(getInitialLanguage)

  useEffect(() => {
    const syncLanguage = () => {
      setLanguageState(getInitialLanguage())
    }

    window.addEventListener('storage', syncLanguage)
    window.addEventListener(LANGUAGE_EVENT, syncLanguage)

    return () => {
      window.removeEventListener('storage', syncLanguage)
      window.removeEventListener(LANGUAGE_EVENT, syncLanguage)
    }
  }, [])

  const setLanguage = useCallback((nextLanguage) => {
    const resolvedLanguage = normalizeLanguage(nextLanguage)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, resolvedLanguage)
    localStorage.setItem(LEGACY_LANGUAGE_STORAGE_KEY, resolvedLanguage)
    setLanguageState(resolvedLanguage)
    window.dispatchEvent(new Event(LANGUAGE_EVENT))
  }, [])

  const t = useCallback(
    (key, variables) => translate(language, key, variables),
    [language]
  )

  return { t, language, setLanguage }
}
