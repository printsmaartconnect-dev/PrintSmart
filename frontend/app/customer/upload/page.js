'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useDropzone } from 'react-dropzone'
import { Cloud, X, FileText, ArrowLeft, Image as ImageIcon, AlertCircle, CheckCircle, MessageCircle } from 'lucide-react'
import useTranslation from '../../../src/hooks/useTranslation'
import BackButton from '../../components/BackButton'
import FeedbackButton from '../../components/FeedbackButton'
import FeedbackLink from '../../components/FeedbackLink'
import FilePreviewSection from '../../components/customer/FilePreviewSection'

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

export default function UploadPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = searchParams.get('shopId')
  const userId = searchParams.get('userId')

  const [files, setFiles] = useState([])
  const [renames, setRenames] = useState({})
  const [uploading, setUploading] = useState(false)
  const [customerComment, setCustomerComment] = useState('')
  const [error, setError] = useState(null)

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
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
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
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

  const handleContinue = async () => {
    if (files.length === 0) {
      setError(t('Please upload at least one document to proceed.'))
      return
    }

    setUploading(true)
    setError(null)
    const uploadedFilesData = []

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

      for (let i = 0; i < files.length; i++) {
        const item = files[i]
        const originalName = item.file.name
        const fileExt = getFileExtension(originalName)

        const customBaseName = renames[i] !== undefined ? renames[i].trim() : getFileBaseName(originalName)
        let customName = customBaseName || getFileBaseName(originalName)

        // Ensure the custom name keeps the real extension on the stored payload.
        if (fileExt && !customName.toLowerCase().endsWith(fileExt.toLowerCase())) {
          customName = `${customName}${fileExt}`
        }

        const formDataPayload = new FormData()
        formDataPayload.append('file', item.file)

        const response = await fetch(`${apiUrl}/api/files/upload`, {
          method: 'POST',
          body: formDataPayload,
        })

        if (!response.ok) {
          throw new Error(`Failed to upload ${originalName}`)
        }

        const result = await response.json()

        // Save file metadata
        uploadedFilesData.push({
          originalFileName: originalName,
          customFileName: customName,
          fileExtension: fileExt,
          fileUrl: result.fileUrl,
          fileSize: item.file.size,
          thumbnailUrl: item.thumbnailUrl || item.previewUrl || result.fileUrl || null,
          uploadTimestamp: new Date().toISOString()
        })
      }

      // Store complete file metadata in localStorage for legacy and current flows.
      localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFilesData))
      localStorage.setItem('uploadCart', JSON.stringify(uploadedFilesData))
      
      // Store customer comment if provided
      if (customerComment.trim()) {
        localStorage.setItem('customerComment', customerComment.trim())
      } else {
        localStorage.removeItem('customerComment')
      }

      const nextUrl = shopId
        ? `/customer/configuration?shopId=${shopId}&userId=${userId}`
        : `/customer/configuration?userId=${userId}`

      router.push(nextUrl)
    } catch (err) {
      console.error('File upload failed:', err)
      setError(err.message || t('Failed to upload files. Please try again.'))
      setUploading(false)
    }
  }

  const handleTalkToShopkeeper = async () => {
    setUploading(true)
    setError(null)

    // Resolve user details
    let resolvedUserId = userId
    let customerName = 'Anonymous Customer'
    let customerPhone = ''
    try {
      const sessionStr = localStorage.getItem('customerSession')
      if (sessionStr) {
        const session = JSON.parse(sessionStr)
        resolvedUserId = session.userId || resolvedUserId
        customerName = session.name || customerName
        customerPhone = session.phone || customerPhone
      }
    } catch (e) {
      console.error('Error loading customer session:', e)
    }

    // Resolve shopkeeper details
    let resolvedShopkeeperId = null
    let shopName = 'Printing Shop'
    try {
      const activeShopStr = localStorage.getItem('activeShop')
      const selectedShopStr = localStorage.getItem('selectedShop')
      const shop = activeShopStr ? JSON.parse(activeShopStr) : selectedShopStr ? JSON.parse(selectedShopStr) : null
      if (shop) {
        resolvedShopkeeperId = shop.id
        shopName = shop.shopName || shopName
      }
    } catch (e) {
      console.error('Error loading shop details:', e)
    }

    if (!resolvedShopkeeperId && shopId) {
      // Fetch shop details by slug if not found in localStorage
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
        const res = await fetch(`${apiUrl}/api/shopkeeper/by-slug/${shopId}`)
        if (res.ok) {
          const data = await res.json()
          resolvedShopkeeperId = data.shopkeeper?.id
          shopName = data.shopkeeper?.shopName || shopName
        }
      } catch (err) {
        console.error('Error fetching shop by slug:', err)
      }
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/orders/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: resolvedUserId,
          shopkeeperId: resolvedShopkeeperId,
          customerName,
          phone: customerPhone,
          items: [{
            fileName: t('Customer wants to talk'),
            fileUrl: '',
            fileSize: 0,
            price: 0,
            variant: 'talk',
            config: {
              copies: 1,
              paperSize: 'A4',
              printType: 'BW',
              sides: 'SINGLE',
              orientation: 'PORTRAIT',
              quality: 'NORMAL'
            }
          }]
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || t('Failed to create talk request'))
      }

      const result = await response.json()
      const primaryOrder = result.orders[0]

      localStorage.setItem('currentOrder', JSON.stringify({
        orderId: primaryOrder.orderId,
        estimatedTime: primaryOrder.estimatedTime,
        price: '0.00',
        shopName: shopName
      }))

      router.push(`/customer/order-placed?shopId=${shopId || ''}&userId=${resolvedUserId || ''}`)
    } catch (err) {
      console.error('Talk request error:', err)
      setError(err.message || t('Failed to initiate talk request. Please try again.'))
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="wave-bg min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
      {/* Step Header */}
      <div className="w-full max-w-5xl mb-8">
        <div className="step-header">
          <div className="step-number">4</div>
          <div>
            <h1 className="text-3xl font-bold text-black font-brand">{t('Upload Documents')}</h1>
            <p className="text-gray-600">{t('Please upload files to print (PDF, Word, Excel, Images, TXT, CSV)')}</p>
          </div>
        </div>
      </div>

      {/* Card Container */}
      <div className="max-w-5xl w-full mx-auto rounded-[36px] bg-white shadow-xl border border-purple-100 p-8 md:p-10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <BackButton />
          </div>
          <span className="text-sm font-semibold text-gray-600">{t('Step 4 of 6')}</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-sm text-red-700 font-semibold">{error}</p>
          </div>
        )}


        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-xl p-8 lg:p-12 text-center transition cursor-pointer ${isDragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
            }`}
        >
          <input {...getInputProps()} />
          <Cloud size={48} className="mx-auto mb-4 text-indigo-500" />
          <p className="text-gray-700 font-medium mb-1">{t('Drag & Drop files here')}</p>
          <p className="text-gray-500 text-sm mb-4">{t('or')}</p>
          <button type="button" className="gradient-button py-2 px-6 text-sm text-white font-semibold">
            {t('Choose Files')}
          </button>
        </div>

        {/* Document Previews Grid */}
        {files.length > 0 && (
          <div className="mt-8 border-b border-gray-200 pb-6 space-y-6">
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
          <div className="mt-8 space-y-4">
            <p className="text-sm font-bold text-gray-700">{t('Uploaded Files & Rename Options:')}</p>
            {files.map((item, index) => {
              const fileBaseName = getFileBaseName(item.file.name)
              return (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50 p-4 rounded-xl gap-4 border border-gray-200"
                >
                  <div className="flex items-center gap-3 flex-1 w-full">
                    {/* Thumbnail Preview */}
                    <div className="w-12 h-12 bg-white rounded border border-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.isLoadingThumbnail ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
                      ) : item.previewUrl ? (
                        <img
                          src={item.previewUrl}
                          alt="Thumbnail preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileText size={24} className="text-red-500" />
                      )}
                    </div>

                    {/* File Renaming Input */}
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={renames[index] !== undefined ? renames[index] : fileBaseName}
                        onChange={(e) => handleRenameChange(index, e.target.value)}
                        placeholder={t('Enter custom filename')}
                        className="w-full bg-white border border-gray-300 rounded px-2.5 py-1 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-gray-500 mt-1 block">
                        {t('Original:')} {item.file.name} • {formatFileSize(item.file.size)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="p-1.5 hover:bg-gray-200 rounded-lg transition self-end sm:self-auto"
                    aria-label="Remove file"
                  >
                    <X size={18} className="text-gray-500" />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Security Message */}
        <p className="text-center text-gray-600 text-sm mt-6 flex items-center justify-center gap-1.5 font-medium">
          <CheckCircle size={16} className="text-green-600" />
          {t('Your files are encrypted and automatically deleted after printing.')}
        </p>

        {/* Customer Comment Field */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('Customer Comment')} <span className="text-gray-400 font-normal">(Optional)</span>
          </label>
          <textarea
            value={customerComment}
            onChange={(e) => setCustomerComment(e.target.value)}
            placeholder={t('Add any special instructions or comments for the shopkeeper...')}
            maxLength={500}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">{customerComment.length}/500</p>
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          disabled={files.length === 0 || uploading}
          className={`w-full py-3 px-4 rounded-xl font-bold transition mt-6 text-white ${files.length > 0 && !uploading
              ? 'gradient-button'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
        >
          {uploading ? t('Uploading Files...') : t('Continue to Print Settings')}
        </button>

        {/* Reusable FeedbackLink */}
        <FeedbackLink />
      </div>

      <FeedbackButton />
    </div>
  )
}