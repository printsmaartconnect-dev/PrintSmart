'use client'

const KEYS = {
  shopkeeper: 'shopkeeper',
  loggedInShopkeeper: 'loggedInShopkeeper',
  profile: 'shopkeeperProfile',
  contact: 'shopkeeperContact',
  socials: 'shopkeeperSocials',
  pricing: 'shopkeeperPricing',
  setupCompleted: 'shopkeeperSetupCompleted',
}

export function getJson(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function setJson(key, value) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getSetupCompleted() {
  if (typeof window === 'undefined') return false
  return window.localStorage.getItem(KEYS.setupCompleted) === 'true'
}

export function setSetupCompleted(completed) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(KEYS.setupCompleted, completed ? 'true' : 'false')
}

export function getLoggedInShopkeeper() {
  return getJson(KEYS.loggedInShopkeeper, null)
}

export function getShopkeeperAccount() {
  return getJson(KEYS.shopkeeper, null)
}

export function getProfile() {
  return getJson(KEYS.profile, {
    shopName: '',
    businessCategory: '',
    subCategory: '',
    languagePreference: '',
    shopOwnerName: '',
    businessDescription: '',
    businessEstablishedYear: '',
    gstNumber: '',
    logoDataUrl: '',
    upiId: '',
    paymentQrUrl: '',
  })
}

export function setProfile(profile) {
  setJson(KEYS.profile, profile)
}

export function getContact() {
  return getJson(KEYS.contact, {
    countryCode: '+91',
    phoneNumber: '',
    alternatePhone: '',
    emailAddress: '',
    website: '',
    shopAddress: '',
  })
}

export function setContact(contact) {
  setJson(KEYS.contact, contact)
}

export function getSocials() {
  return getJson(KEYS.socials, {
    whatsapp: '',
    facebook: '',
    instagram: '',
  })
}

export function setSocials(socials) {
  setJson(KEYS.socials, socials)
}

export function getPricing() {
  const fallback = {
    bwA4: '1.00',
    bwA3: '2.00',
    bwDoubleSide: '1.00',
    colorA4: '5.00',
    colorA3: '8.00',
    colorDoubleSide: '3.00',
    expressPrint: '10.00',
    autoDeleteAfterHours: '24 hrs',
    customAutoDeleteHours: '',
  }

  const stored = getJson(KEYS.pricing, null)
  const pricing = stored ? { ...fallback, ...stored } : fallback

  // Normalize older values
  if (pricing.autoDeleteAfterHours === '24 Hours') pricing.autoDeleteAfterHours = '24 hrs'
  if (pricing.autoDeleteAfterHours === '1 Hours') pricing.autoDeleteAfterHours = '1 hrs'

  return pricing
}

export function setPricing(pricing) {
  setJson(KEYS.pricing, pricing)
}

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidPrice(value) {
  if (value == null) return false
  const numberValue = typeof value === 'number' ? value : parseFloat(String(value))
  return Number.isFinite(numberValue) && numberValue >= 0
}

export function validateProfileRequired(profile, contact) {
  const missing = []

  if (!isNonEmptyString(profile?.shopName)) missing.push('Shop Name')
  if (!isNonEmptyString(profile?.businessCategory)) missing.push('Business Category')
  if (!isNonEmptyString(profile?.languagePreference)) missing.push('Language Preference')
  if (!isNonEmptyString(profile?.businessDescription)) missing.push('Business Description')

  if (!isNonEmptyString(contact?.phoneNumber)) missing.push('Phone Number')
  if (!isNonEmptyString(contact?.emailAddress)) missing.push('Email Address')
  if (!isNonEmptyString(contact?.shopAddress)) missing.push('Shop Address')

  return { ok: missing.length === 0, missing }
}

export function validatePricingRequired(pricing) {
  const missing = []

  if (!isValidPrice(pricing?.bwA4)) missing.push('B&W A4')
  if (!isValidPrice(pricing?.bwA3)) missing.push('B&W A3')
  if (!isValidPrice(pricing?.bwDoubleSide)) missing.push('Double Side B&W')

  if (!isValidPrice(pricing?.colorA4)) missing.push('Color A4')
  if (!isValidPrice(pricing?.colorA3)) missing.push('Color A3')
  if (!isValidPrice(pricing?.colorDoubleSide)) missing.push('Double Side Color')

  if (!isValidPrice(pricing?.expressPrint)) missing.push('Express Print')

  if (!isNonEmptyString(pricing?.autoDeleteAfterHours)) {
    missing.push('Auto Delete After (Hours)')
  } else if (pricing.autoDeleteAfterHours === 'Custom') {
    const custom = parseInt(String(pricing?.customAutoDeleteHours || ''), 10)
    if (!Number.isFinite(custom) || custom <= 0) missing.push('Custom Auto Delete Hours')
  }

  return { ok: missing.length === 0, missing }
}

export function isProfileSetupComplete(profile, contact) {
  return validateProfileRequired(profile, contact).ok
}

export function isPricingSetupComplete(pricing) {
  return validatePricingRequired(pricing).ok
}

export function isOnboardingComplete(shopkeeperAccount) {
  if (typeof window === 'undefined') return false

  const flagCompleted = window.localStorage.getItem(KEYS.setupCompleted) === 'true'
  const accountCompleted = shopkeeperAccount?.setupCompleted === true || shopkeeperAccount?.isOnboarded === true
  const completedSignal = flagCompleted || accountCompleted
  if (!completedSignal) return false

  const profile = getProfile()
  const contact = getContact()
  const pricing = getPricing()

  const profileOk = validateProfileRequired(profile, contact).ok
  const pricingOk = validatePricingRequired(pricing).ok
  return profileOk && pricingOk
}

export function clearOnboardingData() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(KEYS.profile)
  window.localStorage.removeItem(KEYS.contact)
  window.localStorage.removeItem(KEYS.socials)
  window.localStorage.removeItem(KEYS.pricing)
  window.localStorage.removeItem(KEYS.setupCompleted)
}

export function syncLocalStorageFromDb(account) {
  if (typeof window === 'undefined' || !account) return

  // Only sync if address exists (indicating they have completed profile setup in DB)
  if (account.address) {
    const profile = {
      shopName: account.shopName || '',
      businessCategory: account.category || 'Printing & Photocopy',
      subCategory: account.subCategory || 'Xerox & Digital Prints',
      languagePreference: account.languagePref || 'English',
      shopOwnerName: account.ownerName || '',
      businessDescription: account.businessDescription || 'We offer high-quality digital printing services.',
      businessEstablishedYear: account.businessEstablishedYear || '',
      gstNumber: account.gstNumber || '',
      logoDataUrl: account.logoUrl || '',
      shopkeeperIdCode: account.shopkeeperIdCode || '',
      shopSlug: account.shopSlug || '',
      upiId: account.upiId || '',
      paymentQrUrl: account.paymentQrUrl || '',
    }
    window.localStorage.setItem(KEYS.profile, JSON.stringify(profile))

    const contact = {
      countryCode: '+91',
      phoneNumber: account.phone || '',
      alternatePhone: account.alternatePhone || '',
      emailAddress: account.email || '',
      website: account.website || '',
      shopAddress: account.address || '',
    }
    window.localStorage.setItem(KEYS.contact, JSON.stringify(contact))

    if (account.socials) {
      window.localStorage.setItem(KEYS.socials, JSON.stringify(account.socials))
    }

    if (account.pricing) {
      window.localStorage.setItem(KEYS.pricing, JSON.stringify(account.pricing))
      window.localStorage.setItem(KEYS.setupCompleted, 'true')
    }
  }
}

export const STORAGE_KEYS = KEYS
