'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect, Suspense, useCallback } from 'react'
import { Shield, AlertCircle, Loader, ArrowLeft, Cloud, X, FileText, CheckCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import useTranslation from '../../../src/hooks/useTranslation'
import BackButton from '../../components/BackButton'
import FeedbackButton from '../../components/FeedbackButton'
import FeedbackLink from '../../components/FeedbackLink'
import { setCurrentShop, getActiveShop } from '../../../lib/shop-context'
import CustomerHeader from '../../components/customer/CustomerHeader'
import FilePreviewSection from '../../components/customer/FilePreviewSection'

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
]

const OTHER_LANGUAGES = [
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'or', name: 'Odia', native: 'ଓડ଼ିଆ' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
]

const LEGACY_OTHER_LANGUAGE_CODES = {
  Bengali: 'bn',
  Punjabi: 'pa',
  Tamil: 'ta',
  Telugu: 'te',
  Kannada: 'kn',
  Malayalam: 'ml',
  Odia: 'or',
  Urdu: 'ur',
}

const getFileExtension = (name = '') => {
  const lastDotIndex = name.lastIndexOf('.')
  return lastDotIndex >= 0 ? name.slice(lastDotIndex).toLowerCase() : ''
}

const getFileBaseName = (name = '') => {
  const lastDotIndex = name.lastIndexOf('.')
  return lastDotIndex >= 0 ? name.slice(0, lastDotIndex) : name
}

const getPlaceholderTheme = (extension) => {
  switch (extension) {
    case '.xls':
    case '.xlsx':
      return { label: extension.slice(1).toUpperCase(), primary: '#14804A', secondary: '#DDF6E8', accent: '#0F5C33', pattern: 'grid' }
    case '.doc':
    case '.docx':
      return { label: extension.slice(1).toUpperCase(), primary: '#2563EB', secondary: '#DCEBFF', accent: '#1E40AF', pattern: 'lines' }
    case '.txt':
    case '.csv':
      return { label: extension.slice(1).toUpperCase(), primary: '#D97706', secondary: '#FEF3C7', accent: '#92400E', pattern: 'text' }
    case '.pdf':
      return { label: 'PDF', primary: '#DC2626', secondary: '#FEE2E2', accent: '#991B1B', pattern: 'pdf' }
    default:
      return { label: extension ? extension.slice(1).toUpperCase() : 'FILE', primary: '#374151', secondary: '#E5E7EB', accent: '#111827', pattern: 'generic' }
  }
}

const buildPlaceholderThumbnail = (file) => {
  const extension = getFileExtension(file.name)
  const theme = getPlaceholderTheme(extension)
  const initial = extension ? extension.slice(1).toUpperCase() : 'FILE'

  const gridMarkup = theme.pattern === 'grid'
    ? `
      <g opacity="0.9" stroke="${theme.accent}" stroke-width="2">
        <path d="M74 96h72M74 122h72M74 148h72M74 174h72" />
        <path d="M82 88v96M106 88v96M130 88v96" />
      </g>`
    : theme.pattern === 'lines'
      ? `
      <g opacity="0.8" stroke="${theme.accent}" stroke-linecap="round" stroke-width="4">
        <path d="M72 104h92" />
        <path d="M72 126h82" />
        <path d="M72 148h92" />
        <path d="M72 170h72" />
      </g>`
      : theme.pattern === 'text'
        ? `
      <g opacity="0.85" fill="${theme.accent}">
        <rect x="72" y="100" width="92" height="12" rx="6" />
        <rect x="72" y="122" width="112" height="12" rx="6" />
        <rect x="72" y="144" width="86" height="12" rx="6" />
        <rect x="72" y="166" width="68" height="12" rx="6" />
      </g>`
        : `
      <g opacity="0.8" fill="${theme.accent}">
        <rect x="72" y="98" width="108" height="14" rx="7" />
        <rect x="72" y="124" width="92" height="14" rx="7" />
        <rect x="72" y="150" width="76" height="14" rx="7" />
      </g>`

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240" role="img" aria-label="${initial} file preview">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="${theme.secondary}" />
          <stop offset="100%" stop-color="#ffffff" />
        </linearGradient>
        <linearGradient id="card" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#ffffff" />
          <stop offset="100%" stop-color="${theme.secondary}" stop-opacity="0.7" />
        </linearGradient>
      </defs>
      <rect width="240" height="240" rx="28" fill="url(#bg)" />
      <rect x="24" y="24" width="192" height="192" rx="22" fill="url(#card)" stroke="${theme.primary}" stroke-width="2.5" />
      <rect x="44" y="44" width="152" height="34" rx="10" fill="${theme.primary}" opacity="0.12" />
      <circle cx="62" cy="61" r="8" fill="${theme.primary}" />
      <rect x="78" y="55" width="52" height="12" rx="6" fill="${theme.primary}" opacity="0.75" />
      <rect x="150" y="52" width="34" height="18" rx="9" fill="${theme.primary}" opacity="0.2" />
      <text x="164" y="65" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" fill="${theme.primary}">${initial}</text>
      <rect x="44" y="90" width="152" height="110" rx="18" fill="#ffffff" opacity="0.7" stroke="${theme.primary}" stroke-opacity="0.18" />
      ${gridMarkup}
      <rect x="58" y="186" width="124" height="10" rx="5" fill="${theme.primary}" opacity="0.16" />
      <text x="120" y="208" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" font-weight="800" fill="${theme.accent}">${theme.label}</text>
    </svg>`

  return `data:image/svg+xml;base64,${btoa(svg)}`
}

const compressImage = (file, maxWidth = 1920, maxHeight = 1920, quality = 0.8) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file)
      return
    }
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = (event) => {
      const img = new Image()
      img.src = event.target.result
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width)
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height)
            height = maxHeight
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file)
              return
            }
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(compressedFile)
          },
          file.type,
          quality
        )
      }
      img.onerror = () => resolve(file)
    }
    reader.onerror = () => resolve(file)
  })
}

const isVisualFile = (file) => file.type.startsWith('image/') || file.type === 'application/pdf' || getFileExtension(file.name) === '.pdf'

const generateThumbnail = async (file) => {
  try {
    if (file.type.startsWith('image/')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const maxDim = 150;
            let width = img.width;
            let height = img.height;
            if (width > height) {
              if (width > maxDim) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              }
            } else {
              if (height > maxDim) {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.75));
          };
          img.onerror = () => resolve(null);
          img.src = e.target.result;
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async function () {
          try {
            const arrayBuffer = this.result;
            if (!window.pdfjsLib) {
              const script = document.createElement('script');
              script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
              document.head.appendChild(script);
              await new Promise((r) => {
                script.onload = r;
              });
            }

            const pdfjsLib = window.pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

            const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);

            const viewport = page.getViewport({ scale: 0.3 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
              canvasContext: context,
              viewport: viewport
            }).promise;

            resolve(canvas.toDataURL('image/jpeg', 0.75));
          } catch (err) {
            console.error('Error generating PDF thumbnail:', err);
            resolve(buildPlaceholderThumbnail(file));
          }
        };
        reader.onerror = () => resolve(null);
        reader.readAsArrayBuffer(file);
      });
    }
  } catch (err) {
    console.error('Error in generateThumbnail:', err);
  }

  return buildPlaceholderThumbnail(file);
};

function CustomerLanguagePageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = searchParams.get('shopId')
  const { t, setLanguage } = useTranslation()

  const [selectedLanguage, setSelectedLanguage] = useState(null)
  const [selectedOther, setSelectedOther] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [validatingShop, setValidatingShop] = useState(false)
  const [shopError, setShopError] = useState(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: ''
  })

  const [files, setFiles] = useState([])
  const [allowedExts, setAllowedExts] = useState(null)
  const [maintenance, setMaintenance] = useState(false)
  const [notices, setNotices] = useState('')
  const [offers, setOffers] = useState('')

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
        const response = await fetch(`${apiUrl}/api/settings`)
        if (response.ok) {
          const data = await response.json()
          if (data.maintenanceMode) setMaintenance(true)
          if (data.allowedFileFormats) {
            const exts = data.allowedFileFormats.split(',').map(e => e.trim().toLowerCase())
            setAllowedExts(exts)
          }
          if (data.notices) setNotices(data.notices)
          if (data.offers) setOffers(data.offers)
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      }
    }
    fetchSettings()
  }, [])
  const [renames, setRenames] = useState({})
  const [uploading, setUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles) => {
    let filteredFiles = acceptedFiles
    if (allowedExts) {
      filteredFiles = acceptedFiles.filter(file => {
        const ext = getFileExtension(file.name)
        return allowedExts.includes(ext)
      })
      if (filteredFiles.length < acceptedFiles.length) {
        alert(t('Some files were rejected. Allowed formats: ') + allowedExts.join(', ').toUpperCase())
      }
    }

    // Process and compress image files concurrently
    const processedFiles = await Promise.all(
      filteredFiles.map(async (file) => {
        if (file.type.startsWith('image/')) {
          try {
            return await compressImage(file)
          } catch (e) {
            console.error('Image compression failed, using original:', e)
            return file
          }
        }
        return file
      })
    )

    const newFiles = processedFiles.map(file => ({
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      thumbnailUrl: null,
      isLoadingThumbnail: true
    }))

    setFiles((prev) => {
      const updated = [...prev, ...newFiles]

      newFiles.forEach((item, index) => {
        const globalIndex = prev.length + index;
        if (item.isLoadingThumbnail) {
          generateThumbnail(item.file).then((base64) => {
            setFiles((current) =>
              current.map((f, i) =>
                i === globalIndex
                  ? {
                    ...f,
                    thumbnailUrl: base64,
                    previewUrl: base64 || f.previewUrl,
                    isLoadingThumbnail: false
                  }
                  : f
              )
            )
          })
        }
      })

      return updated
    })
  }, [allowedExts, t])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.oasis.opendocument.text': ['.odt'],
      'application/vnd.oasis.opendocument.presentation': ['.odp'],
      'application/vnd.oasis.opendocument.spreadsheet': ['.ods'],
      'application/rtf': ['.rtf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
    },
    maxSize: 52428800,
  })

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
      files.forEach(f => {
        if (f.previewUrl && f.previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(f.previewUrl)
        }
      })
    }
  }, [files])

  const removeFile = (index) => {
    const target = files[index]
    if (target.previewUrl && target.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(target.previewUrl)
    }
    setFiles((prev) => prev.filter((_, i) => i !== index))

    // Cleanup rename entry
    const newRenames = { ...renames }
    delete newRenames[index]
    setRenames(newRenames)
  }

  const handleRenameChange = (index, value) => {
    setRenames(prev => ({
      ...prev,
      [index]: value
    }))
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Auto-detect browser language or load persisted language
  useEffect(() => {
    const saved = localStorage.getItem('customerLanguage')
    if (saved) {
      const match = LANGUAGES.find(l => l.code === saved)
      if (match) {
        setSelectedLanguage(match.code)
      } else {
        const legacyCode = LEGACY_OTHER_LANGUAGE_CODES[saved]
        const otherMatch = OTHER_LANGUAGES.find(l => l.code === saved || l.code === legacyCode)
        if (otherMatch) {
          setSelectedOther(otherMatch.code)
        }
      }
      setLanguage(LANGUAGES.some(l => l.code === saved) ? saved : LEGACY_OTHER_LANGUAGE_CODES[saved] || saved)
      return
    }

    const browserLang = navigator.language || navigator.userLanguage
    const langCode = browserLang.split('-')[0]

    // Match with available languages
    const matched = LANGUAGES.find(l => l.code === langCode)
    if (matched) {
      setSelectedLanguage(matched.code)
      setLanguage(matched.code)
    }
  }, [setLanguage])

  // Validate and store shop details on load
  useEffect(() => {
    const validateShop = async () => {
      if (!shopId) {
        // Check if shop exists in localStorage (from QR scan on homepage)
        const activeShop = getActiveShop()
        if (!activeShop) {
          // No shop in localStorage and no query param - clear stale data
          localStorage.removeItem('activeShopId')
          localStorage.removeItem('activeShopSlug')
          localStorage.removeItem('selectedShop')
          setShopError(t('No printing shop selected. Please scan a QR code or enter a shop ID.'))
        } else {
          setShopError(null)
        }
        return
      }

      // shopId is provided in query params - validate it
      setValidatingShop(true)
      setShopError(null)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
        const response = await fetch(`${apiUrl}/api/shopkeeper/by-slug/${shopId}`)
        if (!response.ok) {
          throw new Error('Shop not found')
        }
        const data = await response.json()

        if (data.shopkeeper && data.shopkeeper.isOnboarded === false) {
          setShopError(t('This printing shop is temporarily deactivated by the platform administration.'))
          return
        }

        // Save using helper
        setCurrentShop(data.shopkeeper)
      } catch (err) {
        console.error('Error validating shop:', err)
        setShopError(t('Invalid Shop ID. Please check the URL or scan the QR code again.'))
      } finally {
        setValidatingShop(false)
      }
    }

    validateShop()
  }, [shopId, t])

  const handleLanguageChange = (code) => {
    if (!code) {
      setSelectedOther(null)
      setSelectedLanguage('en')
      setLanguage('en')
      localStorage.setItem('customerLanguage', 'en')
      return
    }

    if (LANGUAGES.some(l => l.code === code)) {
      setSelectedLanguage(code)
      setSelectedOther(null)
    } else {
      setSelectedLanguage(null)
      setSelectedOther(code)
    }
    setLanguage(code)
    localStorage.setItem('customerLanguage', code)
  }

  const handleDetailsSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError(t('Please enter your name'))
      return
    }

    if (files.length === 0) {
      setError(t('Please upload at least one document to proceed.'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const finalLanguage = selectedOther || selectedLanguage || 'en'

      // Create user in database
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'}/api/users/create`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone || null,
            email: formData.email || null,
            language: finalLanguage
          })
        }
      )

      if (!response.ok) {
        throw new Error(t('Failed to create user'))
      }

      const data = await response.json()
      const userId = data.user.id

      // Store in localStorage
      localStorage.setItem('customerSession', JSON.stringify({
        userId,
        name: formData.name,
        language: finalLanguage
      }))

      // Start file uploads in parallel
      setUploading(true)
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'

      const uploadPromises = files.map(async (item, i) => {
        const originalName = item.file.name
        const fileExt = getFileExtension(originalName)

        const customBaseName = renames[i] !== undefined ? renames[i].trim() : getFileBaseName(originalName)
        let customName = customBaseName || getFileBaseName(originalName)

        if (fileExt && !customName.toLowerCase().endsWith(fileExt.toLowerCase())) {
          customName = `${customName}${fileExt}`
        }

        const formDataPayload = new FormData()
        formDataPayload.append('file', item.file)

        const uploadRes = await fetch(`${apiUrl}/api/files/upload`, {
          method: 'POST',
          body: formDataPayload,
        })

        if (!uploadRes.ok) {
          throw new Error(`Failed to upload ${originalName}`)
        }

        const result = await uploadRes.json()

        return {
          originalFileName: originalName,
          customFileName: customName,
          fileExtension: fileExt,
          fileUrl: result.fileUrl,
          fileSize: item.file.size,
          thumbnailUrl: item.thumbnailUrl || item.previewUrl || result.fileUrl || null,
          uploadTimestamp: new Date().toISOString()
        }
      })

      const uploadedFilesData = await Promise.all(uploadPromises)

      // Store complete file metadata in localStorage
      localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFilesData))
      localStorage.setItem('uploadCart', JSON.stringify(uploadedFilesData))

      // Redirect to configuration page
      const isShopkeeper = searchParams.get('shopkeeperAddOrder') === 'true'
      const resolvedShopId = shopId || localStorage.getItem('activeShopSlug') || localStorage.getItem('activeShopId')
      let nextUrl = resolvedShopId
        ? `/customer/configuration?shopId=${resolvedShopId}&userId=${userId}`
        : `/customer/configuration?userId=${userId}`

      if (isShopkeeper) {
        nextUrl += `&shopkeeperAddOrder=true`
      }

      router.push(nextUrl)
    } catch (err) {
      setError(err.message || t('Failed to proceed'))
      setUploading(false)
    } finally {
      setLoading(false)
    }
  }

  const isShopkeeper = searchParams.get('shopkeeperAddOrder') === 'true'

  return (
    <div className="wave-bg min-h-screen flex flex-col">
      {/* Header */}
      <CustomerHeader stepText={t('Step 1 of 3')} />

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-xl animate-fade-in">
          {maintenance ? (
            <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-slate-100 space-y-6">
              <div className="w-16 h-16 bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center rounded-2xl mx-auto shadow-sm">
                <Shield size={32} className="animate-pulse" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">{t('Platform Maintenance')}</h2>
                <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                  {t('PrintSmart is currently undergoing scheduled system updates. We will be back online shortly. Thank you for your patience!')}
                </p>
              </div>
            </div>
          ) : validatingShop ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center flex flex-col items-center justify-center gap-3">
              <Loader size={36} className="animate-spin text-indigo-600" />
              <p className="text-gray-600 font-semibold">{t('Detecting and validating shop...')}</p>
            </div>
          ) : (
            <>
              {shopError && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 space-y-3">
                  <div className="flex gap-3">
                    <AlertCircle className="text-amber-600 flex-shrink-0 animate-pulse" size={20} />
                    <div className="text-left">
                      <p className="font-semibold text-amber-900">{t('Shop Selection Required')}</p>
                      <p className="text-sm text-amber-700 font-medium">{shopError}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push('/take-a-print')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition"
                  >
                    {t('Scan QR or Enter Shop ID')}
                  </button>
                </div>
              )}

              {/* Consolidation Form Card */}
              <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                <div className="text-center pb-2 border-b border-gray-100">
                  <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('Your Details')} & {t('Upload')}</h1>
                  <p className="text-sm text-gray-500 font-medium">{t('Select language, fill details and upload documents')}</p>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-2 flex gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                )}

                {notices && (
                  <div className="bg-violet-50 border border-violet-150 rounded-xl p-4 mb-2 flex gap-2.5 text-left items-start shadow-sm">
                    <span className="text-base">📢</span>
                    <div>
                      <p className="text-xs font-bold text-violet-800 uppercase tracking-wide">{t('Notice Board')}</p>
                      <p className="text-xs text-violet-700 font-semibold mt-0.5">{notices}</p>
                    </div>
                  </div>
                )}

                {offers && (
                  <div className="bg-amber-50 border border-amber-150 rounded-xl p-4 mb-2 flex gap-2.5 text-left items-start shadow-sm">
                    <span className="text-base">🎁</span>
                    <div>
                      <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">{t('Discounts & Offers')}</p>
                      <p className="text-xs text-amber-700 font-semibold mt-0.5">{offers}</p>
                    </div>
                  </div>
                )}

                {/* 1. Language Selection (One Line Dropdown) */}
                <div className="flex flex-col gap-1.5">
                  <label className="block text-sm font-semibold text-gray-700">
                    {t('Select Language')}
                  </label>
                  <select
                    value={selectedOther || selectedLanguage || 'en'}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm font-semibold text-gray-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 cursor-pointer"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name} {lang.native ? `(${lang.native})` : ''}
                      </option>
                    ))}
                    {OTHER_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        🇮🇳 {lang.name} {lang.native ? `(${lang.native})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Details Form */}
                <form onSubmit={handleDetailsSubmit} className="space-y-4 pt-2">
                  {/* Name (Required) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      {t('Full Name')} <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder={t('Enter your name')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-gray-800 placeholder-gray-400"
                      required
                    />
                  </div>

                  {/* Phone (Optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      {t('Phone Number')} <span className="text-gray-400 font-normal">({t('optional')})</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder={t('10-digit mobile number')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-gray-800 placeholder-gray-400"
                    />
                  </div>

                  {/* Email (Optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      {t('Email')} <span className="text-gray-400 font-normal">({t('optional')})</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder={t('your@email.com')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-gray-800 placeholder-gray-400"
                    />
                  </div>

                  {/* 3. Document Upload Section */}
                  <div className="pt-4 border-t border-gray-100 space-y-4">
                    <label className="block text-sm font-semibold text-gray-700">
                      {t('Upload Documents')} <span className="text-red-650">*</span>
                    </label>

                    {/* Dropzone */}
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${isDragActive
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300 bg-white hover:border-gray-400'
                        }`}
                    >
                      <input {...getInputProps()} />
                      <Cloud size={40} className="mx-auto mb-3 text-indigo-500" />
                      <p className="text-gray-750 font-bold text-sm mb-1">{t('Drag & Drop files here')}</p>
                      <p className="text-gray-500 text-xs mb-3">{t('or')}</p>
                      <button type="button" className="gradient-button py-2 px-5 text-xs text-white font-semibold">
                        {t('Choose Files')}
                      </button>
                    </div>

                    {/* Document Previews Grid */}
                    {files.length > 0 && (
                      <div className="border-b border-gray-200 pb-4 space-y-4">
                        {files.map((item, index) => (
                          <FilePreviewSection
                            key={index}
                            file={{
                              customFileName: renames[index] !== undefined ? renames[index] : getFileBaseName(item.file.name),
                              originalFileName: item.file.name
                            }}
                            thumbnailUrl={item.thumbnailUrl}
                            isBW={false}
                            isLoading={item.isLoadingThumbnail}
                          />
                        ))}
                      </div>
                    )}

                    {/* File List */}
                    {files.length > 0 && (
                      <div className="space-y-3">
                        <p className="text-xs font-bold text-gray-700">{t('Uploaded Files & Rename Options:')}</p>
                        {files.map((item, index) => {
                          const fileBaseName = getFileBaseName(item.file.name)
                          return (
                            <div
                              key={index}
                              className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 p-3 rounded-xl gap-3 border border-gray-200"
                            >
                              <div className="flex items-center gap-3 flex-1 w-full">
                                {/* Thumbnail Preview */}
                                <div className="w-10 h-10 bg-white rounded border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                                  {item.isLoadingThumbnail ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                                  ) : item.previewUrl ? (
                                    <img
                                      src={item.previewUrl}
                                      alt="Thumbnail preview"
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <FileText size={20} className="text-red-500" />
                                  )}
                                </div>

                                {/* File Renaming Input */}
                                <div className="flex-1 min-w-0">
                                  <input
                                    type="text"
                                    value={renames[index] !== undefined ? renames[index] : fileBaseName}
                                    onChange={(e) => handleRenameChange(index, e.target.value)}
                                    placeholder={t('Enter custom filename')}
                                    className="w-full bg-white border border-gray-300 rounded px-2 py-1 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                  />
                                  <span className="text-[10px] text-gray-500 mt-0.5 block truncate">
                                    {t('Original:')} {item.file.name} • {formatFileSize(item.file.size)}
                                  </span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="p-1 hover:bg-gray-200 rounded transition self-end sm:self-auto"
                                aria-label="Remove file"
                              >
                                <X size={16} className="text-gray-500" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Security Message */}
                    <p className="text-center text-gray-650 text-xs mt-4 flex items-center justify-center gap-1.5 font-semibold">
                      <CheckCircle size={14} className="text-green-600" />
                      {t('Your files are encrypted and automatically deleted.')}
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || uploading}
                    className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2 shadow-sm"
                  >
                    {loading || uploading ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        {uploading ? t('Uploading Files...') : t('Processing...')}
                      </>
                    ) : (
                      t('Continue to Print Settings →')
                    )}
                  </button>
                </form>

                <div className="text-center pt-2 border-t border-gray-100">
                  <FeedbackLink />
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <div className="flex items-center justify-center gap-2 mt-8 text-gray-600">
            <Shield size={16} />
            <span className="text-xs sm:text-sm font-semibold">{t('Your data is secured')}</span>
          </div>
        </div>
      </main>

      {/* Floating Feedback Button */}
      <FeedbackButton />
    </div>
  )
}

export default function CustomerLanguagePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader size={36} className="animate-spin text-indigo-600" />
      </div>
    }>
      <CustomerLanguagePageContent />
    </Suspense>
  )
}