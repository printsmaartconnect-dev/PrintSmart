'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
  Info
} from 'lucide-react'

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
  const router = useRouter()
  const [shopName, setShopName] = useState('Default Shop')

  // Toast notifications state
  const [toasts, setToasts] = useState([])

  // Helper to show inline toasts
  const addToast = (message, type = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  // Input Sanitizer to remove dangerous HTML tags/scripts
  const sanitizeText = (text) => {
    return text.replace(/<\/?[^>]+(>|$)/g, '')
  }

  // 1. COMPREHENSIVE COMPONENT STATE ARCHITECTURE
  const [activeTab, setActiveTab] = useState('poster') // Options: 'poster', 'flyer', 'festival', 'social'
  const [creationType, setCreationType] = useState('Poster') // Options: 'Poster', 'Banner', 'Square Post', 'Custom Size'
  const [targetIntent, setTargetIntent] = useState('Sale / Offer') // Options: 'Sale / Offer', 'Festival', 'New Arrival', etc.
  
  const [formData, setFormData] = useState({
    mainHeading: 'BIG DIWALI SALE',
    subHeading: 'Shop More, Save More',
    description: 'Up to 50% OFF on all products. Best offers, best quality, best prices. Celebrate this Diwali with amazing deals. Limited time only!'
  })

  const [selectedCategory, setSelectedCategory] = useState('Popular')
  const [selectedBgSwatch, setSelectedBgSwatch] = useState(0)
  
  // Optional files
  const [uploadedRefFile, setUploadedRefFile] = useState(null)
  const [bgRemovedFile, setBgRemovedFile] = useState(null)
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [canvasScale, setCanvasScale] = useState(1.0) // Float Zoom tracking scale

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
        if (config.formData) setFormData(config.formData)
        if (config.selectedCategory) setSelectedCategory(config.selectedCategory)
        if (config.selectedBgSwatch !== undefined) setSelectedBgSwatch(config.selectedBgSwatch)
        if (config.canvasScale !== undefined) setCanvasScale(config.canvasScale)
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
    setFormData((prev) => ({
      ...prev,
      [key]: sanitized
    }))
  }

  // 3. LIVE TWO-WAY DATA BINDING & POSTER GENERATION CONTROLLER
  const handleGeneratePoster = async (e) => {
    if (e) e.preventDefault()
    if (isGenerating) return

    setIsGenerating(true)
    addToast('Analyzing inputs and preparing AI design templates...', 'info')

    // Simulate AI Generation routine
    setTimeout(() => {
      setIsGenerating(false)
      addToast('Poster successfully generated by PrintSmaart AI!', 'success')

      // Save parameters securely to Local Storage
      const currentConfig = {
        activeTab,
        creationType,
        targetIntent,
        formData,
        selectedCategory,
        selectedBgSwatch,
        canvasScale
      }
      localStorage.setItem('printsmart_last_ai_poster', JSON.stringify(currentConfig))
    }, 1500)
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
    
    // Systematic simulation downloader
    setTimeout(() => {
      const link = document.createElement('a')
      link.download = `printsmart-ai-poster-${Date.now()}.jpg`
      // Direct transparent pixel fallback as dummy image
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
          text: `Check out our new festive poster: ${formData.mainHeading}`,
          url: shareUrl
        })
        addToast('Design shared successfully!', 'success')
      } catch (err) {
        console.warn('Native share failed or dismissed:', err)
      }
    } else {
      // Clipboard fallback
      try {
        await navigator.clipboard.writeText(shareUrl)
        addToast('Share link copied to clipboard fallback!', 'success')
      } catch (err) {
        addToast('Failed to copy link to clipboard.', 'error')
      }
    }
  }

  // Choose background categories list
  const bgCategories = [
    'Popular', 'Festival', 'Diwali', 'Christmas', 'New Year', 'Summer', 'Spring', 'Abstract',
    'Gradient', 'Black & Dark', 'White & Light', 'Nature', 'Flowers', 'Texture', 'Patterns',
    'Business', 'Food', 'Fashion', 'Technology', 'Sports', 'Education', 'Travel', 'Wedding',
    'Birthday', 'Kids', 'Vintage', 'Minimal', 'Luxury', '3D Style', 'Cartoon', 'Watercolor', 'Others'
  ]

  return (
    <div className="min-h-screen bg-[#F8F7FF] text-[#1A1A1A] font-sans pb-16 flex flex-col relative">
      
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`p-4 rounded-xl shadow-lg border flex items-center gap-3 transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-auto ${
              toast.type === 'success'
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

      {/* 1. HEADER & BRANDING BAR */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          {/* Abstract Lens/Camera Smart Printing Icon */}
          <div className="bg-[#6366F1]/10 p-2 rounded-xl text-[#6366F1]">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
              <line x1="12" y1="13" x2="12.01" y2="13" strokeWidth="4" />
            </svg>
          </div>
          <span className="text-xl font-black tracking-tight text-[#1A1A1A] font-brand">PrintSmart</span>
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
        
        {/* B. HERO CONTEXT BANNER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-slate-200 rounded-[24px] p-6 shadow-sm gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A] tracking-tight">
              PrintSmaart AI Studio ✨
            </h1>
            <p className="text-sm font-semibold text-[#64748B] mt-1">
              Create stunning Posters, Banners &amp; more in seconds with AI
            </p>
          </div>
          <button className="flex items-center gap-2 border border-[#6366F1] text-[#6366F1] hover:bg-[#6366F1]/5 px-4.5 py-2.5 rounded-xl text-sm font-bold transition self-start sm:self-auto shadow-sm">
            <Play size={16} fill="currentColor" />
            <span>How it works?</span>
          </button>
        </div>

        {/* 3. WORKSPACE CORE: ROLE MODAL SELECTION BAR */}
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
                onClick={() => {
                  setActiveTab(tab.id)
                  addToast(`Switched mode to ${tab.label}!`, 'info')
                }}
                className={`p-5 rounded-2xl border text-left transition-all ${
                  isActive
                    ? 'border-[#6366F1] bg-white ring-2 ring-[#6366F1]/20 shadow-md scale-[1.01]'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm hover:scale-[1.005]'
                }`}
              >
                <div className={`p-2.5 rounded-xl w-fit ${isActive ? 'bg-[#6366F1] text-white' : 'bg-slate-100 text-[#64748B]'}`}>
                  <TabIcon size={20} />
                </div>
                <div className="mt-3.5 font-bold text-sm text-[#1A1A1A]">{tab.label}</div>
                <div className="text-xs font-semibold text-[#64748B] mt-1">{tab.desc}</div>
              </button>
            )
          })}
        </div>

        {/* 4. SPLIT-SCREEN SPLIT INTERFACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* COLUMN 1: "YOUR POSTER PREVIEW" CANVAS (45% Width) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Your Poster Preview</h2>
              <div className="flex items-center gap-2">
                <div className="flex border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                  <button
                    onClick={handleZoomIn}
                    title="Zoom In"
                    className="bg-white hover:bg-slate-50 px-2.5 py-1.5 text-[#64748B] hover:text-slate-800 transition"
                  >
                    <ZoomIn size={14} />
                  </button>
                  <button
                    onClick={handleZoomOut}
                    title="Zoom Out"
                    className="bg-white hover:bg-slate-50 px-2.5 py-1.5 text-[#64748B] hover:text-slate-800 border-l border-slate-200 transition"
                  >
                    <span className="text-xs font-bold font-mono">Zoom-</span>
                  </button>
                </div>
                <button
                  onClick={handleFit}
                  className="flex items-center gap-1 border border-slate-200 bg-white hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-bold text-[#64748B] shadow-sm transition"
                >
                  <Maximize2 size={14} />
                  <span>Fit</span>
                </button>
              </div>
            </div>

            {/* Main Graphic Display Area Canvas */}
            <div className="w-full relative overflow-hidden bg-slate-100 border border-slate-200 rounded-[28px] flex items-center justify-center p-4">
              <div
                style={{ transform: `scale(${canvasScale})` }}
                className="border-[12px] border-black rounded-[24px] overflow-hidden bg-slate-900 shadow-2xl relative aspect-[3/4] w-full flex flex-col justify-between p-6 select-none transition-all duration-300 origin-center"
              >
                {/* Royal gradient background & mandala pattern selection */}
                <div className={`absolute inset-0 bg-gradient-to-b ${activeSwatchConfig.gradient} transition-all duration-500`} />
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
                  <span className="block text-white text-xs tracking-[0.25em] font-extrabold uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                    BIG
                  </span>
                  
                  <span className="block text-4xl md:text-5xl font-serif font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-500 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] py-1 uppercase break-words">
                    {formData.mainHeading || 'DIWALI'}
                  </span>

                  <span className="block text-white text-lg font-black tracking-[0.2em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]">
                    SALE
                  </span>
                </div>

                {/* Middle Section: Subheading tag ribbon */}
                <div className="z-20 flex flex-col items-center space-y-4 my-auto relative px-2">
                  <div className="bg-gradient-to-r from-amber-500 to-yellow-400 shadow-lg text-amber-950 font-black text-[10px] md:text-xs tracking-wider uppercase px-4 py-2.5 rounded-md border-b-2 border-amber-600 text-center max-w-full truncate">
                    {formData.subHeading || 'SHOP MORE, SAVE MORE'}
                  </div>

                  {/* Core Promo Fraction Stack */}
                  <div className="text-center bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-4.5 min-w-[200px] max-w-full">
                    <div className="text-white/80 text-[9px] font-black tracking-widest uppercase">
                      UP TO
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400 drop-shadow-md py-1">
                      50% OFF
                    </div>
                    <div className="text-white/90 text-[10px] font-bold tracking-wider mt-0.5 uppercase truncate">
                      ON ALL PRODUCTS
                    </div>
                  </div>
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
                    <span className="text-xs font-black tracking-widest text-[#F8F7FF] uppercase">AI Designing...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Canvas Base Row Action Triggers */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleDownload}
                className="flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 py-3 rounded-xl text-sm font-bold text-slate-700 shadow-sm transition active:scale-95"
              >
                <Download size={16} />
                <span>Download</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 py-3 rounded-xl text-sm font-bold text-slate-700 shadow-sm transition active:scale-95"
              >
                <Share2 size={16} />
                <span>Share</span>
              </button>
              <button
                onClick={handleGeneratePoster}
                style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
                className="flex items-center justify-center gap-2 text-white hover:brightness-105 py-3 rounded-xl text-sm font-bold shadow-md transition active:scale-95"
              >
                <RotateCcw size={16} />
                <span>Edit Again</span>
              </button>
            </div>

            {/* Base Footnote Banner */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 flex items-start gap-2.5">
              <span className="text-yellow-500 mt-0.5">💡</span>
              <p className="text-xs font-semibold text-indigo-950 leading-relaxed">
                AI Tip: Add more details in description for better results.
              </p>
            </div>
          </div>

          {/* COLUMN 2: "TELL US ABOUT WHAT YOU WANT TO CREATE" WIZARD (55% Width) */}
          <form
            onSubmit={handleGeneratePoster}
            className="lg:col-span-7 rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6"
          >
            <h2 className="text-lg font-bold text-[#1A1A1A] pb-4 border-b border-slate-100">
              Tell us about what you want to create
            </h2>

            {/* Multi-step setup wizard layout */}
            <div className="space-y-6">
              
              {/* STEP 1: What do you want to create? */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-50 text-[#6366F1] font-bold text-sm flex items-center justify-center border border-indigo-100">
                  1
                </div>
                <div className="flex-1 space-y-3">
                  <label className="block text-sm font-bold text-[#1A1A1A]">What do you want to create?</label>
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
                          className={`py-3 px-2 rounded-xl text-xs font-bold border transition ${
                            isActive
                              ? 'bg-[#8B5CF6] text-white border-[#8B5CF6] shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {type}
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
                  <label className="block text-sm font-bold text-[#1A1A1A]">What is it for? (Choose one)</label>
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
                          className={`py-2 px-3.5 rounded-full text-xs font-bold border transition ${
                            isActive
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {item}
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
                    <label className="block text-sm font-bold text-[#1A1A1A]">Main Heading (Big Text)</label>
                    <span className="text-[10px] font-bold text-slate-400">
                      {formData.mainHeading.length}/100
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.mainHeading}
                    onChange={(e) => handleInputChange('mainHeading', e.target.value, 100)}
                    placeholder="Enter main header text"
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
                    <label className="block text-sm font-bold text-[#1A1A1A]">Sub Heading (Small Text)</label>
                    <span className="text-[10px] font-bold text-slate-400">
                      {formData.subHeading.length}/100
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.subHeading}
                    onChange={(e) => handleInputChange('subHeading', e.target.value, 100)}
                    placeholder="Enter sub heading text"
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
                      Description (Write what you want to show in the poster)
                    </label>
                    <span className="text-[10px] font-bold text-slate-400">
                      {formData.description.length}/500
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value, 500)}
                    placeholder="Describe details for AI poster layout"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] resize-none"
                  />
                </div>
              </div>

              {/* STEP 6: Choose Background */}
              <div className="flex gap-4 items-start">
                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-50 text-[#6366F1] font-bold text-sm flex items-center justify-center border border-indigo-100">
                  6
                </div>
                <div className="flex-1 space-y-3">
                  <label className="block text-sm font-bold text-[#1A1A1A]">Choose Background</label>
                  
                  {/* Categories Microgrid */}
                  <div className="flex flex-wrap gap-1.5 bg-slate-50 border border-slate-200 p-2 rounded-2xl max-h-36 overflow-y-auto">
                    {bgCategories.map((cat) => {
                      const isActive = selectedCategory === cat
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold border transition ${
                            isActive
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
                  <label className="block text-sm font-bold text-[#1A1A1A]">Optional Advanced Integrations</label>
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
                            <span>Remove</span>
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
                      <div className="text-xs font-extrabold text-slate-800">Upload Reference (Optional)</div>
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
                            <span>Remove</span>
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
                      <div className="text-xs font-extrabold text-slate-800">Background Remover (Optional)</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-0.5">Upload image to remove background</div>
                      
                      <div className="text-[9px] font-semibold text-slate-500 mt-2 border-t border-slate-200/60 pt-2">
                        Get clean transparent background
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* STEP 8: Generation Trigger Action */}
              <div className="flex gap-4 items-start pt-2">
                <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-50 text-[#6366F1] font-bold text-sm flex items-center justify-center border border-indigo-100">
                  8
                </div>
                <div className="flex-1 space-y-3">
                  <button
                    type="submit"
                    disabled={isGenerating}
                    style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
                    className="w-full flex items-center justify-center gap-2 text-white font-extrabold py-3.5 px-6 rounded-2xl shadow-lg hover:brightness-105 active:scale-[0.99] transition transform duration-150 text-sm relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 size={16} className="animate-spin text-white" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} className="text-yellow-200 animate-pulse" />
                        <span>Generate Poster</span>
                        <Sparkle size={10} className="absolute top-2 right-12 text-yellow-200/60 animate-ping" />
                        <Sparkle size={8} className="absolute bottom-2 left-16 text-yellow-300/80 animate-bounce" />
                      </>
                    )}
                  </button>
                  <p className="text-[11px] font-bold text-[#64748B] text-center">
                    It only takes 10–20 seconds
                  </p>
                </div>
              </div>

            </div>
          </form>

        </div>

        {/* 5. FOOTER INSTRUCTIONAL DISCOVERY DOCK */}
        <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-2 text-[#6366F1] pb-4 border-b border-slate-100">
            <HelpCircle size={20} />
            <h2 className="text-base font-bold text-[#1A1A1A]">How it works?</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Milestone Step 1 */}
            <div className="flex gap-3 items-start">
              <div className="p-2.5 rounded-xl bg-violet-50 text-[#8B5CF6] flex-shrink-0">
                <Grid size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">1. Choose</h3>
                <p className="text-xs text-[#64748B] font-semibold mt-1">Select what you want to create</p>
              </div>
            </div>

            {/* Milestone Step 2 */}
            <div className="flex gap-3 items-start">
              <div className="p-2.5 rounded-xl bg-violet-50 text-[#8B5CF6] flex-shrink-0">
                <ClipboardCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">2. Fill Details</h3>
                <p className="text-xs text-[#64748B] font-semibold mt-1">Add heading, sub heading &amp; description</p>
              </div>
            </div>

            {/* Milestone Step 3 */}
            <div className="flex gap-3 items-start">
              <div className="p-2.5 rounded-xl bg-violet-50 text-[#8B5CF6] flex-shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">3. AI Creates</h3>
                <p className="text-xs text-[#64748B] font-semibold mt-1">Our AI will design the best poster for you</p>
              </div>
            </div>

            {/* Milestone Step 4 */}
            <div className="flex gap-3 items-start">
              <div className="p-2.5 rounded-xl bg-violet-50 text-[#8B5CF6] flex-shrink-0">
                <Download size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">4. Download &amp; Use</h3>
                <p className="text-xs text-[#64748B] font-semibold mt-1">Download and use anywhere you want</p>
              </div>
            </div>

          </div>
        </div>

        {/* 6. SUB-FOOTER CREDITS */}
        <div className="text-center text-xs font-bold text-[#64748B] pt-4">
          Powered by PrintSmaart AI  •  Made for Indian Print Shops 💜
        </div>

      </main>
    </div>
  )
}
