import en from '../locales/en.json'
import hi from '../locales/hi.json'
import mr from '../locales/mr.json'
import gu from '../locales/gu.json'
import ta from '../locales/ta.json'
import te from '../locales/te.json'
import kn from '../locales/kn.json'
import ml from '../locales/ml.json'
import bn from '../locales/bn.json'
import pa from '../locales/pa.json'
import or from '../locales/or.json'
import ur from '../locales/ur.json'

export const defaultLanguage = 'en'

export const translations = {
  en,
  hi,
  mr,
  gu,
  ta,
  te,
  kn,
  ml,
  bn,
  pa,
  or,
  ur,
}

export const supportedLanguages = Object.keys(translations)

export function normalizeLanguage(language) {
  if (language) return language
  return defaultLanguage
}

export function translate(language, key, variables = {}) {
  const resolvedLanguage = normalizeLanguage(language)
  const fallbackValue = translations[defaultLanguage][key] ?? key
  const value = translations[resolvedLanguage]?.[key] ?? fallbackValue

  return Object.entries(variables).reduce(
    (result, [variableKey, variableValue]) =>
      result.replace(new RegExp(`{{\\s*${variableKey}\\s*}}`, 'g'), String(variableValue)),
    value
  )
}
