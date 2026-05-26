import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from '../locales/en/common.json'
import hiCommon from '../locales/hi/common.json'
import mrCommon from '../locales/mr/common.json'
import guCommon from '../locales/gu/common.json'

const resources = {
  en: { common: enCommon },
  hi: { common: hiCommon },
  mr: { common: mrCommon },
  gu: { common: guCommon },
}

const getInitialLanguage = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('customerLanguage')
    if (saved) return saved
  }
  return 'en'
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    ns: ['common'],
    defaultNS: 'common',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  })

export default i18n
