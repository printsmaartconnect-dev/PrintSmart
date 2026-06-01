'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  Sparkles,
  Play,
  RotateCcw,
  Upload,
  Image as ImageIcon,
  HelpCircle,
  Grid,
  Check,
  Percent,
  Flame,
  ThumbsUp,
  ZoomIn,
  Maximize2,
  Download,
  Share2,
  ClipboardCheck,
  ChevronRight,
  Sparkle,
  Loader2,
  Trash2,
  AlertTriangle,
  Info,
  Send,
  RefreshCw,
  X,
  FileText,
  Sliders,
  Settings,
  Plus,
  Minus,
  Rotate3d
} from 'lucide-react'

// Import Hero and Footer banners statically from the root of frontend
import TopHeroImage from '../../../Top-Of-Ai-Page.jpg'
import BottomImage from '../../../bottom-of-page.jpeg'

// Swatch gradients for background selection
const SWATCHES = [
  { name: 'Royal Diwali Red', gradient: 'from-amber-950 via-red-950 to-amber-950', border: 'border-yellow-500' },
  { name: 'Premium Maroon', gradient: 'from-rose-950 to-red-900', border: 'border-rose-500' },
  { name: 'Warm Orange Glow', gradient: 'from-amber-900 to-orange-700', border: 'border-orange-500' },
  { name: 'Deep Purple Blue', gradient: 'from-violet-950 to-indigo-950', border: 'border-purple-500' },
  { name: 'Royal Cyan Gradient', gradient: 'from-cyan-950 to-indigo-950', border: 'border-cyan-500' },
  { name: 'Sleek Dark Gray', gradient: 'from-slate-950 to-slate-800', border: 'border-slate-500' },
  { name: 'Radiant Cyan Light', gradient: 'from-cyan-900 to-sky-700', border: 'border-sky-500' },
  { name: 'Festive Gold Texture', gradient: 'from-amber-800 via-yellow-700 to-amber-900', border: 'border-amber-500' }
]

// Paper sizes config matching customer flow
const PAPER_SIZES = ['A4', 'A3', 'Legal', 'Letter', 'Executive', 'Ledger', 'Tabloid']

// Diwali Mandala pattern SVG for canvas background
const MandalaPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
    <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
    <circle cx="50" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.5" />
    {[...Array(12)].map((_, i) => {
      const angle = (i * 30 * Math.PI) / 180
      const x1 = 50 + 10 * Math.cos(angle)
      const y1 = 50 + 10 * Math.sin(angle)
      const x2 = 50 + 45 * Math.cos(angle)
      const y2 = 50 + 45 * Math.sin(angle)
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="0.3" />
    })}
  </svg>
)

export default function PrintSmartAiPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [shopName, setShopName] = useState('Default Shop')
  const [toasts, setToasts] = useState([])

  // Choose background categories list
  const bgCategories = [
    'Popular', 'Festival', 'Diwali', 'Christmas', 'New Year', 'Summer', 'Spring', 'Abstract',
    'Gradient', 'Black & Dark', 'White & Light', 'Nature', 'Flowers', 'Texture', 'Patterns',
    'Business', 'Food', 'Fashion', 'Technology', 'Sports', 'Education', 'Travel', 'Wedding',
    'Birthday', 'Kids', 'Vintage', 'Minimal', 'Luxury', '3D Style', 'Cartoon', 'Watercolor', 'Others'
  ]

  // Method Selection State (manual vs chat prompting)
  const [creationMethod, setCreationMethod] = useState('manual') // 'manual' | 'chat'

  // Input Sanitizer to remove dangerous HTML tags/scripts
  const sanitizeText = (text) => {
    return text.replace(/<\/?[^>]+(>|$)/g, '')
  }

  // Helper to show inline toasts
  const addToast = (message, type = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  // 1. CORE COMPONENT CONFIGURATION STATE
  const [activeTab, setActiveTab] = useState('poster') // Options: 'poster', 'flyer', 'festival', 'social'
  const [creationType, setCreationType] = useState('Poster') // Options: 'Poster', 'Banner', 'Square Post', 'Custom Size'
  const [targetIntent, setTargetIntent] = useState('Sale / Offer') // Options: 'Sale / Offer', 'Festival', 'New Arrival', etc.

  const [posterData, setPosterData] = useState({
    headline: 'BIG DIWALI SALE',
    subheadline: 'Shop More, Save More',
    offerText: '50% OFF',
    description: 'Up to 50% OFF on all products. Celebrate this Diwali with amazing deals.',
    cta: 'Order Now',
    theme: 'Popular'
  })

  const [selectedCategory, setSelectedCategory] = useState('Popular')
  const [selectedBgSwatch, setSelectedBgSwatch] = useState(0)

  // Optional files (Manual uploads)
  const [uploadedRefFile, setUploadedRefFile] = useState(null)
  const [bgRemovedFile, setBgRemovedFile] = useState(null)

  const [isGenerating, setIsGenerating] = useState(false)
  const [canvasScale, setCanvasScale] = useState(1.0) // Float Zoom tracking scale

  // Print Layout Config States (AI updates these, user can tweak manually)
  const [copies, setCopies] = useState(1)
  const [printType, setPrintType] = useState('BW') // 'BW' | 'COLOR'
  const [paperSize, setPaperSize] = useState('A4')
  const [sides, setSides] = useState('SINGLE') // 'SINGLE' | 'DOUBLE'
  const [quality, setQuality] = useState('NORMAL') // 'DRAFT' | 'NORMAL' | 'HIGH'
  const [orientation, setOrientation] = useState('PORTRAIT') // 'PORTRAIT' | 'LANDSCAPE'

  // 2. CHAT PROMPTING SPECIFIC STATE
  const [promptText, setPromptText] = useState('')
  const [chatFiles, setChatFiles] = useState([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [errorState, setErrorState] = useState(null)
  const [generatedConfig, setGeneratedConfig] = useState(null)
  const [promptHistory, setPromptHistory] = useState([
    {
      id: 1,
      text: "Print 50 black and white thesis pages A4 double sided high quality",
      timestamp: "11:32 AM",
      result: { copies: 50, printType: "BW", paperSize: "A4", sides: "DOUBLE", quality: "HIGH", orientation: "PORTRAIT", swatchName: "Sleek Dark Gray" }
    },
    {
      id: 2,
      text: "20 color copies of a wedding brochure landscape A3 double sided",
      timestamp: "10:15 AM",
      result: { copies: 20, printType: "COLOR", paperSize: "A3", sides: "DOUBLE", quality: "HIGH", orientation: "LANDSCAPE", swatchName: "Festive Gold Texture" }
    }
  ])

  // Sync shop keeper profile details
  useEffect(() => {
    const loggedIn = localStorage.getItem('authToken')
    if (!loggedIn) {
      router.replace('/shopkeeper/login')
      return
    }

    try {
      const account = JSON.parse(localStorage.getItem('shopkeeper') || 'null')
      if (account?.shopName) {
        setShopName(account.shopName)
      }
    } catch {
      // Keep default shopName
    }

    // Retrieve previous design configuration from localStorage if present
    const cachedConfig = localStorage.getItem('printsmart_last_ai_poster')
    if (cachedConfig) {
      try {
        const config = JSON.parse(cachedConfig)
        if (config.activeTab) setActiveTab(config.activeTab)
        if (config.creationType) setCreationType(config.creationType)
        if (config.targetIntent) setTargetIntent(config.targetIntent)
        if (config.posterData) {
          setPosterData(config.posterData)
        } else if (config.formData) {
          setPosterData({
            headline: config.formData.mainHeading || '',
            subheadline: config.formData.subHeading || '',
            offerText: '50% OFF',
            description: config.formData.description || '',
            cta: 'Order Now',
            theme: 'Popular'
          })
        }
        if (config.selectedCategory) setSelectedCategory(config.selectedCategory)
        if (config.selectedBgSwatch !== undefined) setSelectedBgSwatch(config.selectedBgSwatch)
        if (config.canvasScale !== undefined) setCanvasScale(config.canvasScale)
        if (config.creationMethod) setCreationMethod(config.creationMethod)

        // Restore print configs
        if (config.copies) setCopies(config.copies)
        if (config.printType) setPrintType(config.printType)
        if (config.paperSize) setPaperSize(config.paperSize)
        if (config.sides) setSides(config.sides)
        if (config.quality) setQuality(config.quality)
        if (config.orientation) setOrientation(config.orientation)

        addToast('Restored last active AI poster configurations!', 'info')
      } catch (err) {
        console.warn('Failed to load cached AI configurations:', err)
      }
    }
  }, [router])

  // Swatch configuration mapping based on active selection
  const activeSwatchConfig = useMemo(() => {
    return SWATCHES[selectedBgSwatch] || SWATCHES[0]
  }, [selectedBgSwatch])

  // Form input update handlers with inline sanitization
  const handleInputChange = (key, value, maxLength) => {
    const sanitized = sanitizeText(value).substring(0, maxLength)
    setPosterData((prev) => ({
      ...prev,
      [key]: sanitized
    }))
  }

  // 3. GENERATION ACTION CONTROLLERS (MANUAL & REAL GROQ AI CHAT)
  const handleGeneratePoster = async (e) => {
    if (e) e.preventDefault()
    if (isGenerating) return

    setIsGenerating(true)
    addToast('Analyzing inputs and preparing AI design templates...', 'info')

    // Simulate AI Generation routine
    setTimeout(() => {
      setIsGenerating(false)
      addToast('Poster successfully generated by PrintSmart AI!', 'success')

      // Save parameters securely to Local Storage
      const currentConfig = {
        activeTab,
        creationType,
        targetIntent,
        posterData,
        selectedCategory,
        selectedBgSwatch,
        canvasScale,
        creationMethod,
        copies,
        printType,
        paperSize,
        sides,
        quality,
        orientation
      }
      localStorage.setItem('printsmart_last_ai_poster', JSON.stringify(currentConfig))
    }, 1500)
  }

  // Real conversational AI generation calling our API Route
  const handleChatGenerate = async (e) => {
    if (e) e.preventDefault()
    if (!promptText.trim()) {
      addToast('Please enter a prompt instruction first.', 'error')
      return
    }
    if (isGenerating) return

    setIsGenerating(true)
    setErrorState(null)
    addToast('Contacting Groq AI schema extractor...', 'info')

    try {
      const response = await fetch('/api/ai/generate-config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ prompt: promptText })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to contact Groq model server endpoint.')
      }

      const aiConfig = await response.json()

      // Set posterData state instantly to trigger canvas re-render
      setPosterData({
        headline: aiConfig.headline || '',
        subheadline: aiConfig.subheadline || '',
        offerText: aiConfig.offerText || '',
        description: aiConfig.description || '',
        cta: aiConfig.cta || '',
        theme: aiConfig.theme || ''
      })

      // Save to generatedConfig state to display the premium AI card
      setGeneratedConfig(aiConfig)

      // Dynamically select background swatch based on the AI generated theme
      const themeLower = (aiConfig.theme || '').toLowerCase()
      let swatchIdx = 3 // Default: Deep Purple Blue
      if (themeLower.includes('red') || themeLower.includes('maroon') || themeLower.includes('diwali') || themeLower.includes('festival')) {
        swatchIdx = 0 // Royal Diwali Red
      } else if (themeLower.includes('warm') || themeLower.includes('orange') || themeLower.includes('glow')) {
        swatchIdx = 2 // Warm Orange Glow
      } else if (themeLower.includes('cyan') || themeLower.includes('blue') || themeLower.includes('light')) {
        swatchIdx = 6 // Radiant Cyan Light
      } else if (themeLower.includes('dark') || themeLower.includes('gray') || themeLower.includes('sleek') || themeLower.includes('black')) {
        swatchIdx = 5 // Sleek Dark Gray
      } else if (themeLower.includes('gold') || themeLower.includes('yellow')) {
        swatchIdx = 7 // Festive Gold Texture
      } else if (themeLower.includes('purple') || themeLower.includes('violet')) {
        swatchIdx = 3 // Deep Purple Blue
      } else if (themeLower.includes('rose') || themeLower.includes('pink')) {
        swatchIdx = 1 // Premium Maroon
      }
      setSelectedBgSwatch(swatchIdx)

      // Add to prompt history list
      const newPromptEntry = {
        id: Date.now(),
        text: promptText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        result: {
          headline: aiConfig.headline || '',
          subheadline: aiConfig.subheadline || '',
          offerText: aiConfig.offerText || '',
          description: aiConfig.description || '',
          cta: aiConfig.cta || '',
          theme: aiConfig.theme || '',
          swatchIdx: swatchIdx,
          swatchName: SWATCHES[swatchIdx].name
        }
      }
      setPromptHistory(prev => [newPromptEntry, ...prev])

      addToast('PrintSmart AI configured layout successfully!', 'success')

      // Save settings to Local Storage
      const currentConfig = {
        activeTab,
        creationType,
        targetIntent,
        posterData: {
          headline: aiConfig.headline || '',
          subheadline: aiConfig.subheadline || '',
          offerText: aiConfig.offerText || '',
          description: aiConfig.description || '',
          cta: aiConfig.cta || '',
          theme: aiConfig.theme || ''
        },
        selectedCategory,
        selectedBgSwatch: swatchIdx,
        canvasScale,
        creationMethod,
        copies,
        printType,
        paperSize,
        sides,
        quality,
        orientation
      }
      localStorage.setItem('printsmart_last_ai_poster', JSON.stringify(currentConfig))

    } catch (err) {
      console.error('Groq generation error:', err)
      setErrorState(err.message || 'Error occurred during AI generation.')
      addToast(err.message || 'Error occurred during AI generation.', 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  // 4. MULTI-FILE ATTACHMENT & DROPZONE SIMULATOR LOGIC
  const processUploadedFile = (e, fileSetter) => {
    const file = e.target.files?.[0]
    if (!file) return

    // MIME type check
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (!allowedTypes.includes(file.type)) {
      addToast('Unsupported file type. Please upload a PNG or JPEG image.', 'error')
      e.target.value = ''
      return
    }

    // Size check (10MB)
    if (file.size > 10 * 1024 * 1024) {
      addToast('File too large! Maximum allowed reference file size is 10MB.', 'error')
      e.target.value = ''
      return
    }

    // Build URL pathways
    const objectUrl = URL.createObjectURL(file)
    fileSetter(objectUrl)
    addToast(`Successfully processed file: ${file.name}`, 'success')
  }

  // Chat prompting file upload handler
  const handleChatFileUpload = (e) => {
    const files = Array.from(e.target.files || [])
    const parsedFiles = []

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        addToast(`File ${file.name} is too large (Max 10MB)`, 'error')
        continue
      }
      parsedFiles.push({
        id: Date.now() + Math.random(),
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        url: URL.createObjectURL(file)
      })
    }

    setChatFiles(prev => [...prev, ...parsedFiles])
    if (parsedFiles.length > 0) {
      addToast(`Attached ${parsedFiles.length} file(s) for AI prompt reference`, 'success')
    }
  }

  // 5. LOCAL CANVAS CONTROL WORKFLOWS (ZOOM, FIT, DOWNLOAD, SHARE)
  const handleZoomIn = () => {
    setCanvasScale((prev) => {
      const next = prev + 0.1
      if (next > 1.4) {
        addToast('Maximum zoom level reached!', 'info')
        return 1.4
      }
      return parseFloat(next.toFixed(1))
    })
  }

  const handleZoomOut = () => {
    setCanvasScale((prev) => {
      const next = prev - 0.1
      if (next < 0.6) {
        addToast('Minimum zoom level reached!', 'info')
        return 0.6
      }
      return parseFloat(next.toFixed(1))
    })
  }

  const handleFit = () => {
    setCanvasScale(1.0)
    addToast('Canvas scaled back to default fit layout.', 'info')
  }

  const handleDownload = () => {
    addToast('Exporting design to image file...', 'info')

    setTimeout(() => {
      const link = document.createElement('a')
      link.download = `printsmart-ai-poster-${Date.now()}.jpg`
      link.href = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400"><rect width="100%" height="100%" fill="%236366F1"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-family="sans-serif" font-size="20">PrintSmart AI Poster</text></svg>'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      addToast('Download completed successfully!', 'success')
    }, 800)
  }

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/share/poster-preview`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PrintSmart AI Poster design',
          text: `Check out our new festive poster: ${posterData.headline}`,
          url: shareUrl
        })
        addToast('Design shared successfully!', 'success')
      } catch (err) {
        console.warn('Native share failed or dismissed:', err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl)
        addToast('Share link copied to clipboard fallback!', 'success')
      } catch (err) {
        addToast('Failed to copy link to clipboard.', 'error')
      }
    }
  }

  // 6. FORM & SYSTEM RESET WORKFLOWS
  const handleReset = () => {
    setPosterData({
      headline: 'BIG DIWALI SALE',
      subheadline: 'Shop More, Save More',
      offerText: '50% OFF',
      description: 'Up to 50% OFF on all products. Celebrate this Diwali with amazing deals.',
      cta: 'Order Now',
      theme: 'Popular'
    })
    setSelectedBgSwatch(0)
    setCreationType('Poster')
    setTargetIntent('Sale / Offer')
    setUploadedRefFile(null)
    setBgRemovedFile(null)
    setPromptText('')
    setChatFiles([])
    setCopies(1)
    setPrintType('BW')
    setPaperSize('A4')
    setSides('SINGLE')
    setQuality('NORMAL')
    setOrientation('PORTRAIT')
    setGeneratedConfig(null)
    setErrorState(null)
    addToast('Reset configurations to default settings.', 'info')
  }

  const handleCancelAction = () => {
    setPromptText('')
    setChatFiles([])
    setErrorState(null)
    addToast('Form action canceled.', 'info')
  }

  const handleSaveConfiguration = () => {
    addToast('Layout configuration saved successfully!', 'success')
  }

  // Pre-fill prompt text helper
  const selectExamplePrompt = (text) => {
    setPromptText(text)
    addToast(`Selected example prompt!`, 'info')
  }

  // Mock template switcher based on category tabs
  const handleTabChange = (tabId, label) => {
    setActiveTab(tabId)
    addToast(`Switched mode to ${label}!`, 'info')

    if (tabId === 'flyer') {
      setPosterData({
        headline: 'MEGA WEEKEND OFFER',
        subheadline: 'Buy 1 Get 1 Free',
        offerText: 'Buy 1 Get 1 Free',
        description: 'Exclusive weekend special deals across all store sections. Grab yours now before stocks run out. High quality paper prints available!',
        cta: 'Claim Now',
        theme: 'Popular'
      })
      setSelectedBgSwatch(2) // Orange
      setCreationType('Banner')
      setTargetIntent('Sale / Offer')
    } else if (tabId === 'festival') {
      setPosterData({
        headline: 'HAPPY DIWALI',
        subheadline: 'Festival of Lights & Deals',
        offerText: 'SPECIAL PRICE',
        description: 'Celebrate the festive season with custom designs, traditional sweets patterns, and vibrant color configurations.',
        cta: 'Shop Now',
        theme: 'Festival'
      })
      setSelectedBgSwatch(7) // Gold
      setCreationType('Poster')
      setTargetIntent('Festival')
    } else if (tabId === 'social') {
      setPosterData({
        headline: 'JOIN THE COMMUNITY',
        subheadline: 'Follow Us on Social Media',
        offerText: 'FREE JOIN',
        description: 'Scan the barcode on print outputs to join our network. Weekly updates, custom design drops.',
        cta: 'Follow Us',
        theme: 'Popular'
      })
      setSelectedBgSwatch(3) // Deep Purple
      setCreationType('Square Post')
      setTargetIntent('Event')
    } else {
      setPosterData({
        headline: 'BIG DIWALI SALE',
        subheadline: 'Shop More, Save More',
        offerText: '50% OFF',
        description: 'Up to 50% OFF on all products. Celebrate this Diwali with amazing deals.',
        cta: 'Order Now',
        theme: 'Popular'
      })
      setSelectedBgSwatch(0)
      setCreationType('Poster')
      setTargetIntent('Sale / Offer')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7FF] text-[#1A1A1A] font-sans pb-16 flex flex-col relative">

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-auto ${toast.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : toast.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-800'
              }`}
          >
            <div className="flex-shrink-0">
              {toast.type === 'success' && <Check size={18} />}
              {toast.type === 'error' && <AlertTriangle size={18} />}
              {toast.type === 'info' && <Info size={18} />}
            </div>
            <p className="text-xs font-bold leading-relaxed flex-1">{toast.message}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="text-slate-400 hover:text-slate-600 font-bold text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* 1. HEADER & BRANDING BAR WITH BACK BUTTON */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/shopkeeper/dashboard')}
            className="mr-3 p-2 hover:bg-slate-100 rounded-xl transition text-slate-600 flex items-center justify-center animate-pulse-slow"
            title="Back to Dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>

          <div className="bg-[#6366F1]/10 p-2 rounded-xl text-[#6366F1]">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
              <line x1="12" y1="13" x2="12.01" y2="13" strokeWidth="4" />
            </svg>
          </div>
          <span className="text-xl font-brand tracking-tight text-[#1A1A1A] font-black">PrintSmart</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3.5 py-1.5 text-xs font-bold text-[#6366F1]">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="9" y1="21" x2="9" y2="9" />
              <line x1="3" y1="9" x2="21" y2="9" />
            </svg>
            <span>Shop Pro</span>
          </div>
          <span className="text-xs font-bold text-[#64748B]">Shop ID: 1024</span>
          <div className="h-9 w-9 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            SP
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* A. HERO IMAGE BANNER (TOP OF PAGE) */}
        <div className="w-full relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 bg-white">
          <img
            src={TopHeroImage.src}
            alt="PrintSmart AI Studio Hero Banner"
            className="w-full h-auto object-cover max-h-[300px]"
          />
        </div>

        {/* B. CATEGORY SELECTION BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {[
            { id: 'poster', label: 'AI Poster & Banner Maker', icon: ImageIcon, desc: 'Generate marketing materials' },
            { id: 'flyer', label: 'Offer Flyer Maker', icon: Percent, desc: 'Create promotional flyers' },
            { id: 'festival', label: 'Festival Promotion', icon: Flame, desc: 'Design festive season posters' },
            { id: 'social', label: 'Social Media Post', icon: ThumbsUp, desc: 'Create digital square layouts' }
          ].map((tab) => {
            const TabIcon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id, t(tab.label))}
                className={`p-5 rounded-2xl border text-left transition-all ${isActive
                    ? 'border-[#6366F1] bg-white ring-2 ring-[#6366F1]/20 shadow-md scale-[1.01]'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm hover:scale-[1.005]'
                  }`}
              >
                <div className={`p-2.5 rounded-xl w-fit ${isActive ? 'bg-[#6366F1] text-white' : 'bg-slate-100 text-[#64748B]'}`}>
                  <TabIcon size={20} />
                </div>
                <div className="mt-3.5 font-bold text-sm text-[#1A1A1A]">{t(tab.label)}</div>
                <div className="text-xs font-semibold text-[#64748B] mt-1">{t(tab.desc)}</div>
              </button>
            )
          })}
        </div>

        {/* C. METHOD SELECTOR (MANUAL CREATION VS CHAT PROMPTING) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => {
              setCreationMethod('manual')
              addToast('Switched to Manual Creation mode.', 'info')
            }}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all transform hover:scale-[1.01] text-center w-full focus:outline-none ${creationMethod === 'manual'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-md'
                : 'border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50/60 text-indigo-700/80 hover:text-indigo-800 shadow-sm'
              }`}
          >
            <span className="text-2xl mb-1.5">⚙️</span>
            <span className="text-sm font-extrabold">{t('Manual Creation')}</span>
            <span className="text-[10px] text-slate-400 font-normal mt-0.5">{t('Configure print layouts step-by-step manually')}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCreationMethod('chat')
              addToast('Switched to Chat Prompting mode.', 'info')
            }}
            className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all transform hover:scale-[1.01] text-center w-full focus:outline-none ${creationMethod === 'chat'
                ? 'border-indigo-600 bg-indigo-50 text-indigo-800 shadow-md'
                : 'border-indigo-100 bg-indigo-50/30 hover:bg-indigo-50/60 text-indigo-700/80 hover:text-indigo-800 shadow-sm'
              }`}
          >
            <span className="text-2xl mb-1.5">💬</span>
            <span className="text-sm font-extrabold">{t('Chat Prompting')}</span>
            <span className="text-[10px] text-slate-400 font-normal mt-0.5">{t('Generate prints and layouts using natural prompts')}</span>
          </button>
        </div>

        {/* D. SPLIT LAYOUT WORKSPACE */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">

          {/* LEFT SIDE: CONFIGURATION AREA (Scrolls normally) */}
          <div className="lg:col-span-7 space-y-6">

            {/* PANEL A: MANUAL CREATION COMPONENT */}
            {creationMethod === 'manual' && (
              <form
                onSubmit={handleGeneratePoster}
                className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-[#1A1A1A]">
                    {t('Tell us about what you want to create')}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs font-bold text-[#6366F1] hover:text-[#8B5CF6] transition flex items-center gap-1.5"
                    >
                      <RotateCcw size={12} />
                      <span>{t('Reset Form')}</span>
                    </button>
                  </div>
                </div>

                <div className="space-y-6">

                  {/* STEP 1: What do you want to create? */}
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-50 text-[#6366F1] font-bold text-sm flex items-center justify-center border border-indigo-100">
                      1
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="block text-sm font-bold text-[#1A1A1A]">{t('What do you want to create?')}</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {['Poster', 'Banner', 'Square Post', 'Custom Size'].map((type) => {
                          const isActive = creationType === type
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => {
                                setCreationType(type)
                                addToast(`Changed format to ${type}!`, 'info')
                              }}
                              className={`py-3 px-2 rounded-xl text-xs font-bold border transition ${isActive
                                  ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                            >
                              {t(type)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* STEP 2: What is it for? */}
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-50 text-[#6366F1] font-bold text-sm flex items-center justify-center border border-indigo-100">
                      2
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="block text-sm font-bold text-[#1A1A1A]">{t('Target Intent')}</label>
                      <div className="flex flex-wrap gap-2">
                        {['Sale / Offer', 'Festival', 'New Arrival', 'Grand Opening', 'Event', 'Other'].map((item) => {
                          const isActive = targetIntent === item
                          return (
                            <button
                              key={item}
                              type="button"
                              onClick={() => {
                                setTargetIntent(item)
                                addToast(`Set promotional intent to ${item}!`, 'info')
                              }}
                              className={`py-2 px-3.5 rounded-full text-xs font-bold border transition ${isActive
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                            >
                              {t(item)}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: Main Heading */}
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-50 text-[#6366F1] font-bold text-sm flex items-center justify-center border border-indigo-100">
                      3
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-bold text-[#1A1A1A]">{t('Headline Text')}</label>
                        <span className="text-[10px] font-bold text-slate-400">
                          {(posterData.headline || '').length}/100
                        </span>
                      </div>
                      <input
                        type="text"
                        value={posterData.headline}
                        onChange={(e) => handleInputChange('headline', e.target.value, 100)}
                        placeholder={t('Headline Text')}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
                      />
                    </div>
                  </div>

                  {/* STEP 4: Sub Heading */}
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-50 text-[#6366F1] font-bold text-sm flex items-center justify-center border border-indigo-100">
                      4
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-bold text-[#1A1A1A]">{t('Subheadline Text')}</label>
                        <span className="text-[10px] font-bold text-slate-400">
                          {(posterData.subheadline || '').length}/100
                        </span>
                      </div>
                      <input
                        type="text"
                        value={posterData.subheadline}
                        onChange={(e) => handleInputChange('subheadline', e.target.value, 100)}
                        placeholder={t('Subheadline Text')}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
                      />
                    </div>
                  </div>

                  {/* STEP 5: Description */}
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-50 text-[#6366F1] font-bold text-sm flex items-center justify-center border border-indigo-100">
                      5
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="block text-sm font-bold text-[#1A1A1A]">
                          {t('Description / Details')}
                        </label>
                        <span className="text-[10px] font-bold text-slate-400">
                          {(posterData.description || '').length}/500
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={posterData.description}
                        onChange={(e) => handleInputChange('description', e.target.value, 500)}
                        placeholder={t('Description / Details')}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] resize-none"
                      />
                    </div>
                  </div>

                  {/* STEP 5.5: Offer Text & CTA */}
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-50 text-[#6366F1] font-bold text-sm flex items-center justify-center border border-indigo-100">
                      5.5
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-bold text-[#1A1A1A]">{t('Offer / Discount Text')}</label>
                          <span className="text-[10px] font-bold text-slate-400">
                            {(posterData.offerText || '').length}/50
                          </span>
                        </div>
                        <input
                          type="text"
                          value={posterData.offerText}
                          onChange={(e) => handleInputChange('offerText', e.target.value, 50)}
                          placeholder={t('Offer / Discount Text')}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-bold text-[#1A1A1A]">{t('Button Call To Action')}</label>
                          <span className="text-[10px] font-bold text-slate-400">
                            {(posterData.cta || '').length}/50
                          </span>
                        </div>
                        <input
                          type="text"
                          value={posterData.cta}
                          onChange={(e) => handleInputChange('cta', e.target.value, 50)}
                          placeholder={t('Button Call To Action')}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* STEP 6: Choose Background */}
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-50 text-[#6366F1] font-bold text-sm flex items-center justify-center border border-indigo-100">
                      6
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="block text-sm font-bold text-[#1A1A1A]">{t('Select background swatch')}</label>

                      {/* Categories Microgrid */}
                      <div className="flex flex-wrap gap-1.5 bg-slate-50 border border-slate-200 p-2 rounded-2xl max-h-36 overflow-y-auto">
                        {bgCategories.map((cat) => {
                          const isActive = selectedCategory === cat
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setSelectedCategory(cat)}
                              className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition ${isActive
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                            >
                              {cat}
                            </button>
                          )
                        })}
                      </div>

                      {/* Visual Swatch Carousel */}
                      <div className="flex gap-3 items-center overflow-x-auto py-1">
                        {SWATCHES.map((swatch, idx) => {
                          const isActive = selectedBgSwatch === idx
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedBgSwatch(idx)
                                addToast(`Applied background theme: ${swatch.name}`, 'info')
                              }}
                              className={`h-11 w-11 rounded-xl flex-shrink-0 border-2 bg-gradient-to-b ${swatch.gradient} ${swatch.border} relative flex items-center justify-center transition shadow-sm hover:scale-105`}
                              aria-label={`Select ${swatch.name}`}
                            >
                              {isActive && (
                                <div className="absolute inset-0 bg-black/25 rounded-[9px] flex items-center justify-center text-white">
                                  <Check size={16} strokeWidth={3} />
                                </div>
                              )}
                            </button>
                          )
                        })}
                        <button
                          type="button"
                          onClick={() => addToast('More themes coming soon!', 'info')}
                          className="h-11 px-3 border border-slate-200 hover:bg-slate-50 rounded-xl flex-shrink-0 text-xs font-bold text-slate-500 shadow-sm transition"
                        >
                          More
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* STEP 7: Optional Advanced Integrations */}
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-50 text-[#6366F1] font-bold text-sm flex items-center justify-center border border-indigo-100">
                      7
                    </div>
                    <div className="flex-1 space-y-3">
                      <label className="block text-sm font-bold text-[#1A1A1A]">{t('Optional Advanced Integrations')}</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Option A: Upload Reference */}
                        <div className="relative border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 p-4 rounded-2xl text-center cursor-pointer transition min-h-[140px] flex flex-col justify-between">
                          {uploadedRefFile ? (
                            <div className="absolute inset-2 bg-white rounded-xl overflow-hidden shadow-sm flex items-center justify-center z-10 group">
                              <img src={uploadedRefFile} alt="Reference upload" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setUploadedRefFile(null)
                                  addToast('Removed reference image.', 'info')
                                }}
                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs"
                              >
                                <Trash2 size={14} />
                                <span>{t('Delete Order')}</span>
                              </button>
                            </div>
                          ) : null}

                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={(e) => processUploadedFile(e, setUploadedRefFile)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                          />

                          <div className="mx-auto w-fit p-2 rounded-xl bg-slate-200/50 text-slate-500 mb-1.5">
                            <Upload size={18} />
                          </div>
                          <div className="text-xs font-extrabold text-slate-800">{t('Upload Reference Image')}</div>
                          <div className="text-[10px] font-bold text-slate-400 mt-0.5">PNG, JPG (Max 10MB)</div>

                          <div className="text-[9px] font-semibold text-slate-500 mt-2 border-t border-slate-200/60 pt-2">
                            Helps AI understand the style you want
                          </div>
                        </div>

                        {/* Option B: Background Remover */}
                        <div className="relative border border-dashed border-slate-300 bg-slate-50/50 hover:bg-slate-50 p-4 rounded-2xl text-center cursor-pointer transition min-h-[140px] flex flex-col justify-between">
                          {bgRemovedFile ? (
                            <div className="absolute inset-2 bg-white rounded-xl overflow-hidden shadow-sm flex items-center justify-center z-10 group">
                              <img src={bgRemovedFile} alt="Transparent background preview" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setBgRemovedFile(null)
                                  addToast('Removed target layout image.', 'info')
                                }}
                                className="absolute inset-0 bg-black/50 text-white flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-xs"
                              >
                                <Trash2 size={14} />
                                <span>{t('Delete Order')}</span>
                              </button>
                            </div>
                          ) : null}

                          <input
                            type="file"
                            accept="image/png, image/jpeg, image/jpg"
                            onChange={(e) => processUploadedFile(e, setBgRemovedFile)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                          />

                          <div className="mx-auto w-fit p-2 rounded-xl bg-slate-200/50 text-slate-500 mb-1.5">
                            <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.34 18.65a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72Z" />
                              <path d="m14 7 3 3" />
                              <path d="M5 6v.01" />
                              <path d="M19 14v.01" />
                              <path d="M10 2v.01" />
                              <path d="M7 21v.01" />
                              <path d="M14 22v.01" />
                            </svg>
                          </div>
                          <div className="text-xs font-extrabold text-slate-800">{t('Remove Background AI')}</div>
                          <div className="text-[10px] font-bold text-slate-400 mt-0.5">Upload image to remove background</div>

                          <div className="text-[9px] font-semibold text-slate-500 mt-2 border-t border-slate-200/60 pt-2">
                            Get clean transparent background
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* STEP 8: Print Layout Configuration Controls (Unified layout) */}
                  <div className="flex gap-4 items-start pt-2 border-t border-slate-100">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-50 text-[#6366F1] font-bold text-sm flex items-center justify-center border border-indigo-100">
                      8
                    </div>
                    <div className="flex-1 space-y-4">
                      <label className="block text-sm font-bold text-[#1A1A1A]">{t('Print Configuration')}</label>

                      {/* Print Type */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-500">{t('Print Type')}</span>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => { setPrintType('BW'); addToast('Set manual print to Black & White', 'info') }}
                            className={`py-2.5 px-4 rounded-xl font-bold text-xs transition border-2 ${printType === 'BW'
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                          >
                            {t('Black & White')}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setPrintType('COLOR'); addToast('Set manual print to Color', 'info') }}
                            className={`py-2.5 px-4 rounded-xl font-bold text-xs transition border-2 ${printType === 'COLOR'
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                          >
                            {t('Color')}
                          </button>
                        </div>
                      </div>

                      {/* Copies control */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-500">{t('Copies')}</span>
                        <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl w-fit border border-slate-200">
                          <button
                            type="button"
                            onClick={() => setCopies(prev => Math.max(1, prev - 1))}
                            className="p-1.5 hover:bg-slate-200 rounded transition text-slate-600"
                          >
                            <Minus size={16} />
                          </button>
                          <input
                            type="number"
                            value={copies}
                            onChange={(e) => setCopies(Math.max(1, parseInt(e.target.value) || 1))}
                            min="1"
                            max="999"
                            className="w-12 text-center text-sm font-bold text-slate-800 bg-transparent outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setCopies(prev => Math.min(999, prev + 1))}
                            className="p-1.5 hover:bg-slate-200 rounded transition text-slate-600"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Paper Sizing */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-500">{t('Paper Size')}</span>
                        <select
                          value={paperSize}
                          onChange={(e) => setPaperSize(e.target.value)}
                          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {PAPER_SIZES.map(size => (
                            <option key={size} value={size}>{t(size)}</option>
                          ))}
                        </select>
                      </div>

                      {/* Sides Duplex selection */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-500">{t('Print Sides')}</span>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setSides('SINGLE')}
                            className={`py-2.5 px-4 rounded-xl font-bold text-xs transition border-2 ${sides === 'SINGLE'
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                          >
                            {t('Single-sided')}
                          </button>
                          <button
                            type="button"
                            onClick={() => setSides('DOUBLE')}
                            className={`py-2.5 px-4 rounded-xl font-bold text-xs transition border-2 ${sides === 'DOUBLE'
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                          >
                            {t('Double-sided')}
                          </button>
                        </div>
                      </div>

                      {/* Orientation & Print Quality */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-slate-500">{t('Orientation')}</span>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setOrientation('PORTRAIT')}
                              className={`py-2 px-1 rounded-lg font-bold text-[10px] transition border-2 text-center flex items-center justify-center gap-1 ${orientation === 'PORTRAIT'
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                }`}
                            >
                              {t('Portrait')}
                            </button>
                            <button
                              type="button"
                              onClick={() => setOrientation('LANDSCAPE')}
                              className={`py-2 px-1 rounded-lg font-bold text-[10px] transition border-2 text-center flex items-center justify-center gap-1 ${orientation === 'LANDSCAPE'
                                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                }`}
                            >
                              {t('Landscape')}
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-slate-500">{t('Print Quality')}</span>
                          <div className="grid grid-cols-3 gap-1">
                            {['DRAFT', 'NORMAL', 'HIGH'].map(q => (
                              <button
                                type="button"
                                key={q}
                                onClick={() => setQuality(q)}
                                className={`py-2 px-0.5 rounded-lg font-bold text-[9px] transition border-2 text-center ${quality === q
                                    ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                  }`}
                              >
                                {t(q.charAt(0) + q.slice(1).toLowerCase())}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* STEP 9: Generation Trigger Action */}
                  <div className="flex gap-4 items-start pt-2 border-t border-slate-100">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-50 text-[#6366F1] font-bold text-sm flex items-center justify-center border border-indigo-100">
                      9
                    </div>
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={handleReset}
                          className="py-3.5 px-4 border border-slate-200 bg-white hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw size={14} />
                          <span>{t('Reset Form')}</span>
                        </button>
                        <button
                          type="submit"
                          disabled={isGenerating}
                          style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
                          className="w-full flex items-center justify-center gap-2 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg hover:brightness-105 active:scale-[0.99] transition transform duration-150 text-xs relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isGenerating ? (
                            <>
                              <Loader2 size={14} className="animate-spin text-white" />
                              <span>{t('Processing...')}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={14} className="text-yellow-200 animate-pulse" />
                              <span>{t('Generate Design')}</span>
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-[11px] font-bold text-[#64748B] text-center">
                        It only takes 10–20 seconds
                      </p>
                    </div>
                  </div>

                </div>
              </form>
            )}

            {/* PANEL B: CHAT PROMPTING COMPONENT */}
            {creationMethod === 'chat' && (
              <div className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">

                {/* Chat Panel Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-violet-50 text-[#8B5CF6]">
                      <Sparkles size={18} className="animate-pulse" />
                    </span>
                    <div>
                      <h2 className="text-base font-bold text-[#1A1A1A]">{t('Conversational AI Print Setup')}</h2>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{t('Ask PrintSmart AI to setup your prints...')}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCancelAction}
                    className="p-1 text-slate-400 hover:text-slate-600 transition"
                    title="Clear input"
                  >
                    <X size={18} />
                  </button>
                </div>

                {/* Example Prompts Shelf */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Example prompts:')}</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { text: "Print 50 black and white thesis pages A4 double sided high quality", icon: "✨" },
                      { text: "20 color copies of a wedding brochure landscape A3 double sided", icon: "📄" },
                      { text: "Bulk office print optimization", icon: "🏢" },
                      { text: "15 copies legal size single sided color normal quality orientation portrait", icon: "🪔" }
                    ].map((example, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => selectExamplePrompt(example.text)}
                        className="py-1.5 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 text-slate-700 hover:text-indigo-800 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                      >
                        <span>{example.icon}</span>
                        <span className="max-w-[200px] truncate">{example.text}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Conversational Input Area */}
                <form onSubmit={handleChatGenerate} className="space-y-4 pt-2">

                  {/* Error Notification Block */}
                  {errorState && (
                    <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-800 shadow-sm animate-pulse-slow">
                      <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-rose-600" />
                      <div className="flex-1">
                        <h4 className="text-xs font-bold uppercase tracking-wider">AI Configuration Error</h4>
                        <p className="text-xs font-semibold leading-relaxed mt-1">{errorState}</p>
                        <button
                          type="button"
                          onClick={() => setErrorState(null)}
                          className="text-[10px] font-bold text-rose-600 hover:text-rose-800 underline mt-2"
                        >
                          Dismiss Error
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#1A1A1A]">{t('Tell us about what you want to create')}</label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder={t('Ask PrintSmart AI to setup your prints...')}
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-[#1A1A1A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] resize-none"
                      />
                      <button
                        type="submit"
                        disabled={!promptText.trim() || isGenerating}
                        style={{ background: promptText.trim() ? 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' : '#E2E8F0' }}
                        className="absolute right-3.5 bottom-3.5 p-2.5 rounded-xl text-white hover:brightness-105 active:scale-95 disabled:scale-100 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center shadow-md"
                        title="Submit prompt to AI"
                      >
                        {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Drag-Drop Upload Area */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-[#1A1A1A]">{t('Upload Reference Image')} ({t('optional')})</label>

                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault()
                        setIsDragOver(false)
                        handleChatFileUpload(e)
                      }}
                      className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition relative flex flex-col items-center justify-center min-h-[140px] ${isDragOver ? 'border-[#6366F1] bg-[#6366F1]/5' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
                        }`}
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/*,application/pdf,.doc,.docx"
                        onChange={handleChatFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="p-2.5 bg-slate-200/50 text-slate-500 rounded-xl mb-2">
                        <Upload size={18} />
                      </div>
                      <div className="text-xs font-extrabold text-slate-800">{t('Drag & Drop files here')}</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1">{t('or')} {t('Choose Files')}</div>
                    </div>

                    {/* Render Uploaded Files in Chat */}
                    {chatFiles.length > 0 && (
                      <div className="space-y-2 max-h-36 overflow-y-auto pt-2">
                        {chatFiles.map((file) => (
                          <div key={file.id} className="flex items-center justify-between p-3 bg-[#6366F1]/5 border border-[#6366F1]/10 rounded-xl">
                            <div className="flex items-center gap-2">
                              <FileText size={16} className="text-[#6366F1]" />
                              <div>
                                <div className="text-xs font-bold text-slate-800 max-w-[200px] truncate">{file.name}</div>
                                <div className="text-[9px] font-semibold text-slate-400 mt-0.5">{file.size}</div>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setChatFiles(prev => prev.filter(f => f.id !== file.id))
                                addToast('Attached file removed.', 'info')
                              }}
                              className="text-slate-400 hover:text-rose-600 transition p-1"
                              title="Delete attachment"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Drawer */}
                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={handleCancelAction}
                      className="py-3.5 px-4 border border-slate-200 bg-white hover:bg-slate-50 rounded-2xl text-xs font-bold text-slate-700 shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <X size={14} />
                      <span>{t('Cancel')}</span>
                    </button>
                    <button
                      type="submit"
                      disabled={isGenerating || !promptText.trim()}
                      style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
                      className="w-full flex items-center justify-center gap-2 text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg hover:brightness-105 active:scale-[0.99] transition transform duration-150 text-xs relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 size={14} className="animate-spin text-white" />
                          <span>{t('Processing...')}</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} className="text-yellow-200 animate-pulse" />
                          <span>{t('Generate Design')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* PREMIUM AI GENERATED PREVIEW CARD (Visible after response) */}
                {generatedConfig && (
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-[20px] p-5 space-y-4 shadow-sm animate-pulse-slow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-1 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                          <Check size={14} strokeWidth={3} />
                        </span>
                        <span className="text-xs font-bold text-indigo-800">{t('Active')} AI {t('Print Configuration')}</span>
                      </div>
                      <button
                        onClick={() => {
                          setGeneratedConfig(null)
                          addToast('AI configuration preview cleared.', 'info')
                        }}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition"
                      >
                        {t('Clear Card', 'Clear Card')}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-400 font-bold block mb-0.5">{t('Copies')}</span>
                        <span className="font-extrabold text-slate-800 text-sm">{(generatedConfig.headline || '').substring(0, 35)}...</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-400 font-bold block mb-0.5">{t('Offer / Discount Text')}</span>
                        <span className="font-extrabold text-slate-800 text-xs">
                          {generatedConfig.offerText || 'N/A'}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-400 font-bold block mb-0.5">{t('Button Call To Action')}</span>
                        <span className="font-extrabold text-slate-800 text-xs">{generatedConfig.cta || 'N/A'}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-400 font-bold block mb-0.5">{t('Subheadline Text')}</span>
                        <span className="font-extrabold text-slate-800 text-[10px] block truncate">
                          {generatedConfig.subheadline || 'N/A'}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 col-span-2 flex justify-between items-center">
                        <div>
                          <span className="text-slate-400 font-bold block mb-0.5">{t('Theme category')}</span>
                          <span className="font-extrabold text-slate-800 text-[10px] block truncate max-w-[200px]">
                            Theme: {generatedConfig.theme || 'Default'} • {generatedConfig.description ? 'Has description' : 'No description'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCreationMethod('manual')
                            addToast('Loaded config in Manual panel for adjustments!', 'info')
                          }}
                          className="text-[10px] font-bold text-[#6366F1] hover:text-[#8b5cf6] flex items-center gap-1 transition"
                        >
                          <Sliders size={11} />
                          <span>{t('Configure print layouts step-by-step manually', 'Tweak Manually')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Prompt History List */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Prompt History')}</h3>

                  {promptHistory.length === 0 ? (
                    <div className="text-center py-6 border border-slate-100 rounded-2xl bg-slate-50/50">
                      <p className="text-xs font-semibold text-slate-400">No prompts generated yet. Start prompting above!</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {promptHistory.map((item) => (
                        <div key={item.id} className="p-3 border border-slate-100 bg-slate-50 rounded-xl space-y-2 hover:bg-slate-100/50 transition">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-[#6366F1] bg-[#6366F1]/10 px-2 py-0.5 rounded-md font-brand">{t('AI Poster & Banner Maker')}</span>
                            <span className="text-[9px] font-bold text-slate-400">{item.timestamp}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-700 leading-normal font-mono">"{item.text}"</p>

                          <div className="flex flex-wrap gap-1.5 pt-1.5 border-t border-slate-200/50">
                            <span className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full max-w-[120px] truncate">
                              {item.result.headline}
                            </span>
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                              {item.result.offerText}
                            </span>
                            <span className="text-[9px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                              {item.result.cta} • {item.result.swatchName}
                            </span>
                          </div>

                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                setPosterData({
                                  headline: item.result.headline,
                                  subheadline: item.result.subheadline,
                                  offerText: item.result.offerText,
                                  description: item.result.description,
                                  cta: item.result.cta,
                                  theme: item.result.theme
                                })
                                if (item.result.swatchIdx !== undefined) {
                                  setSelectedBgSwatch(item.result.swatchIdx)
                                }
                                setGeneratedConfig({
                                  headline: item.result.headline,
                                  subheadline: item.result.subheadline,
                                  offerText: item.result.offerText,
                                  description: item.result.description,
                                  cta: item.result.cta,
                                  theme: item.result.theme
                                })
                                addToast('Re-applied history configurations to manual controls!', 'success')
                              }}
                              className="text-[10px] font-extrabold text-[#6366F1] hover:text-[#8b5cf6] flex items-center gap-1 transition"
                            >
                              <RefreshCw size={10} />
                              <span>{t('Apply to Panel', 'Apply to Panel')}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPromptHistory(prev => prev.filter(p => p.id !== item.id))
                                addToast('History entry deleted.', 'info')
                              }}
                              className="text-[10px] font-extrabold text-slate-400 hover:text-rose-600 transition"
                            >
                              {t('Delete Order')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* QUICK ACTIONS UTILITY BAR */}
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">{t('Interactive Controls')}</h3>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Manage generation outputs instantly</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-2 px-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs shadow-sm transition"
                >
                  {t('Reset Form')}
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfiguration}
                  className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
                >
                  {t('Save Configuration')}
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: PREVIEW PANEL (Sticky on desktop, scrollable internally) */}
          <div className="lg:col-span-5 lg:sticky lg:top-[90px] lg:h-[calc(100vh-130px)] lg:overflow-y-auto pr-1 space-y-4 pb-6">
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <h2 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-1.5">
                <Sliders size={16} className="text-[#6366F1]" />
                <span>{t('Canvas Preview')}</span>
              </h2>
              <div className="flex items-center gap-1.5">
                <div className="flex border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    onClick={handleZoomIn}
                    type="button"
                    title="Zoom In"
                    className="bg-white hover:bg-slate-50 p-1.5 text-[#64748B] hover:text-slate-800 transition"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    type="button"
                    title="Zoom Out"
                    className="bg-white hover:bg-slate-50 p-1.5 text-[#64748B] hover:text-slate-800 border-l border-slate-200 transition"
                  >
                    <span className="text-[10px] font-black font-mono">Zoom-</span>
                  </button>
                </div>
                <button
                  onClick={handleFit}
                  type="button"
                  className="flex items-center gap-1 border border-slate-200 bg-white hover:bg-slate-50 px-2 py-1.5 rounded-lg text-xs font-bold text-[#64748B] transition"
                >
                  <Maximize2 size={12} />
                  <span>{t('Fit Screen')}</span>
                </button>
              </div>
            </div>

            {/* Main Graphic Display Area Canvas */}
            <div className="w-full relative overflow-hidden bg-slate-100 border border-slate-200 rounded-[28px] flex items-center justify-center p-4 min-h-[460px]">
              <div
                style={{ transform: `scale(${canvasScale})` }}
                className={`border-[12px] border-black rounded-[24px] overflow-hidden bg-slate-900 shadow-2xl relative w-full flex flex-col justify-between p-6 select-none transition-all duration-300 origin-center ${orientation === 'LANDSCAPE' ? 'aspect-[4/3]' : 'aspect-[3/4]'
                  }`}
              >
                {/* Royal gradient background & mandala pattern selection (applies grayscale if printType is black and white) */}
                <div className={`absolute inset-0 bg-gradient-to-b ${activeSwatchConfig.gradient} transition-all duration-500 ${printType === 'BW' ? 'grayscale contrast-125' : ''
                  }`} />
                <MandalaPattern />

                {/* Shimmering Fireworks Vectors & Lanterns */}
                <div className="absolute top-0 inset-x-0 h-40 pointer-events-none z-10 opacity-70">
                  {/* Simulated Lanterns */}
                  <div className="absolute top-0 left-8 flex flex-col items-center">
                    <div className="w-[1px] h-8 bg-yellow-500/80" />
                    <div className="w-5 h-6 bg-red-600 rounded-full border border-yellow-500 shadow-[0_0_12px_#ef4444]" />
                    <div className="w-3 h-1 bg-yellow-500" />
                  </div>
                  <div className="absolute top-0 right-8 flex flex-col items-center">
                    <div className="w-[1px] h-12 bg-yellow-500/80" />
                    <div className="w-5 h-6 bg-red-600 rounded-full border border-yellow-500 shadow-[0_0_12px_#ef4444]" />
                    <div className="w-3 h-1 bg-yellow-500" />
                  </div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-[1px] h-6 bg-yellow-500/80" />
                    <div className="w-6 h-7 bg-orange-500 rounded-full border border-yellow-500 shadow-[0_0_12px_#f97316]" />
                    <div className="w-4.5 h-1 bg-yellow-500" />
                  </div>

                  {/* Golden Fireworks (CSS) */}
                  <div className="absolute top-10 left-12 w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_20px_6px_#facc15]" />
                  <div className="absolute top-20 right-16 w-2 h-2 rounded-full bg-yellow-400 shadow-[0_0_24px_8px_#facc15]" />
                  <div className="absolute top-6 right-24 w-1 h-1 rounded-full bg-yellow-300 shadow-[0_0_16px_4px_#fde047]" />
                </div>

                {/* Central Typography Stack (Linked to state inputs) */}
                <div className="z-20 text-center mt-12 space-y-1.5 relative px-2">
                  <span className="block text-3xl md:text-4xl font-serif font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-500 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] py-1 uppercase break-words leading-none">
                    {posterData.headline || 'BIG DIWALI SALE'}
                  </span>
                </div>

                {/* Middle Section: Subheading tag ribbon */}
                <div className="z-20 flex flex-col items-center space-y-4 my-auto relative px-2">
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-400 shadow-lg text-amber-950 font-black text-[10px] md:text-xs tracking-wider uppercase px-4 py-2.5 rounded-md border-b-2 border-amber-600 text-center max-w-full break-words">
                    {posterData.subheadline || 'SHOP MORE, SAVE MORE'}
                  </div>

                  {/* Core Promo Fraction Stack */}
                  <div className="text-center bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4.5 min-w-[200px] max-w-full">
                    <div className="text-yellow-300 text-[10px] font-black tracking-widest uppercase">
                      LIMITED OFFER
                    </div>
                    <div className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-400 drop-shadow-md py-1 break-words uppercase leading-tight">
                      {posterData.offerText || '50% OFF'}
                    </div>
                    {posterData.description && (
                      <div className="text-white/70 text-[9px] font-medium leading-relaxed my-1 max-h-16 overflow-hidden text-ellipsis line-clamp-2 px-1">
                        {posterData.description}
                      </div>
                    )}
                    <div className="text-white/95 text-[9px] font-bold tracking-widest mt-1.5 uppercase flex items-center justify-center gap-1 border-t border-white/10 pt-1.5">
                      <span>{copies} COPIES</span>
                      <span>•</span>
                      <span>{paperSize}</span>
                      <span>•</span>
                      <span>{sides === 'DOUBLE' ? 'DUPLEX' : 'SIMPLEX'}</span>
                    </div>
                  </div>

                  {/* Call to Action Button */}
                  {posterData.cta && (
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-400 text-slate-950 font-black text-[10px] md:text-xs tracking-wider uppercase px-5 py-2.5 rounded-full shadow-lg border-t border-yellow-200 transition transform hover:scale-105 active:scale-95 text-center mt-1 z-20">
                      {posterData.cta}
                    </div>
                  )}
                </div>

                {/* Base Elements: Diyas & Scarlet shelf */}
                <div className="z-20 flex flex-col items-center justify-end mt-auto pt-4 relative">
                  <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-red-950 to-red-900 border-t border-amber-500/20 -mx-6 -mb-6" />

                  <div className="flex items-end justify-center gap-6 relative z-10 pb-1">
                    {/* Left Diya */}
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-5 bg-gradient-to-t from-orange-600 via-yellow-400 to-yellow-100 rounded-full animate-pulse shadow-[0_0_12px_4px_rgba(250,204,21,0.6)]" />
                      <div className="w-8 h-4 bg-amber-700 rounded-b-full border-t-2 border-amber-800 shadow-md" />
                    </div>

                    {/* Gift boxes */}
                    <div className="flex gap-1.5 items-end opacity-90">
                      <div className="w-7 h-7 bg-red-600 border border-yellow-500 rounded relative shadow-md">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-yellow-500" />
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-yellow-500" />
                      </div>
                      <div className="w-9 h-9 bg-red-700 border border-yellow-500 rounded relative shadow-md">
                        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-yellow-500" />
                        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-yellow-500" />
                      </div>
                    </div>

                    {/* Right Diya */}
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-5 bg-gradient-to-t from-orange-600 via-yellow-400 to-yellow-100 rounded-full animate-pulse shadow-[0_0_12px_4px_rgba(250,204,21,0.6)]" />
                      <div className="w-8 h-4 bg-amber-700 rounded-b-full border-t-2 border-amber-800 shadow-md" />
                    </div>
                  </div>
                </div>

                {/* Processing Overlay loader spinner */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white gap-2 transition-all">
                    <Loader2 size={36} className="animate-spin text-[#6366F1]" />
                    <span className="text-xs font-black tracking-widest text-[#F8F7FF] uppercase">{t('Processing...')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas Action Bar */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleDownload}
                type="button"
                className="flex items-center justify-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 py-3 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition active:scale-95"
              >
                <Download size={14} />
                <span>{t('Download')}</span>
              </button>
              <button
                onClick={handleShare}
                type="button"
                className="flex items-center justify-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 py-3 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition active:scale-95"
              >
                <Share2 size={14} />
                <span>{t('Share QR')}</span>
              </button>

              {/* Tweak/Configure design mode toggler */}
              {creationMethod === 'chat' ? (
                <button
                  onClick={() => {
                    setCreationMethod('manual')
                    addToast('Loaded parameters in Manual setup configurations!', 'success')
                  }}
                  type="button"
                  className="flex items-center justify-center gap-1.5 bg-indigo-50 border border-indigo-100 text-[#6366F1] hover:bg-indigo-100 py-3 rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
                >
                  <Sliders size={14} />
                  <span>{t('Configure printer', 'Configure')}</span>
                </button>
              ) : (
                <button
                  onClick={handleGeneratePoster}
                  type="button"
                  className="flex items-center justify-center gap-1.5 bg-indigo-50 border border-indigo-100 text-[#6366F1] hover:bg-indigo-100 py-3 rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
                >
                  <RotateCcw size={14} />
                  <span>{t('Refresh Status', 'Refresh')}</span>
                </button>
              )}
            </div>

            {/* Base Footnote Tip Banner */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 flex items-start gap-2.5 shadow-sm">
              <span className="text-yellow-500 mt-0.5">💡</span>
              <p className="text-xs font-semibold text-indigo-950 leading-relaxed">
                {t('💡 Tip:')} {t('AI Tip: Switch between creation styles above. Conversational prompt generation uses real Groq AI processing to prefill configuration settings!', 'Switch between creation styles above. Conversational prompt generation uses real Groq AI processing to prefill configuration settings!')}
              </p>
            </div>
          </div>

        </div>

        {/* E. RESPONSIVE FOOTER IMAGE BANNER (BOTTOM OF PAGE) */}
        <div className="w-full mt-8 rounded-3xl overflow-hidden shadow-sm border border-slate-200 bg-white">
          <img
            src={BottomImage.src}
            alt="PrintSmart AI Features Bottom Banner"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* F. INSTRUCTIONAL DISCOVERY DOCK */}
        <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-[#6366F1] pb-4 border-b border-slate-100">
            <HelpCircle size={20} />
            <h2 className="text-base font-bold text-[#1A1A1A]">{t('How PrintSmart AI works?', 'How PrintSmart AI works?')}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {/* Milestone Step 1 */}
            <div className="flex gap-3 items-start">
              <div className="p-2.5 rounded-xl bg-violet-50 text-[#8B5CF6] flex-shrink-0">
                <Grid size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">{t('1. Choose Creation Method', '1. Choose Creation Method')}</h3>
                <p className="text-xs text-[#64748B] font-semibold mt-1">{t('Configure layout options manually or converse using AI prompting', 'Configure layout options manually or converse using AI prompting')}</p>
              </div>
            </div>

            {/* Milestone Step 2 */}
            <div className="flex gap-3 items-start">
              <div className="p-2.5 rounded-xl bg-violet-50 text-[#8B5CF6] flex-shrink-0">
                <ClipboardCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">{t('2. Attach Files & Details', '2. Attach Files & Details')}</h3>
                <p className="text-xs text-[#64748B] font-semibold mt-1">{t('Provide sample attachments or descriptions to assist the generation process', 'Provide sample attachments or descriptions to assist the generation process')}</p>
              </div>
            </div>

            {/* Milestone Step 3 */}
            <div className="flex gap-3 items-start">
              <div className="p-2.5 rounded-xl bg-violet-50 text-[#8B5CF6] flex-shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">{t('3. AI Computes Layout', '3. AI Computes Layout')}</h3>
                <p className="text-xs text-[#64748B] font-semibold mt-1">{t('AI engine parses parameters, matches colors, and renders typography instantly', 'AI engine parses parameters, matches colors, and renders typography instantly')}</p>
              </div>
            </div>

            {/* Milestone Step 4 */}
            <div className="flex gap-3 items-start">
              <div className="p-2.5 rounded-xl bg-violet-50 text-[#8B5CF6] flex-shrink-0">
                <Download size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">{t('4. Instant Download', '4. Instant Download')}</h3>
                <p className="text-xs text-[#64748B] font-semibold mt-1">{t('Download your high-resolution layout and proceed to printing queues', 'Download your high-resolution layout and proceed to printing queues')}</p>
              </div>
            </div>

          </div>
        </div>

        {/* G. SUB-FOOTER CREDITS */}
        <div className="text-center text-xs font-bold text-[#64748B] pt-4">
          {t('Powered by PrintSmart AI  •  Made for Indian Print Shops 💜', 'Powered by PrintSmart AI  •  Made for Indian Print Shops 💜')}
        </div>

      </main>
    </div>
  )
}
