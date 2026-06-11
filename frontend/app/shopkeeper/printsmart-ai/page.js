'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import {
  Sparkles,
  Play,
  RotateCcw,
  Image as ImageIcon,
  HelpCircle,
  Grid,
  Check,
  Percent,
  Flame,
  ThumbsUp,
  Download,
  Share2,
  ClipboardCheck,
  Loader2,
  AlertTriangle,
  Info,
  Send,
  RefreshCw,
  X,
  FileText,
  Sliders,
  Settings,
  Upload,
  Minus,
  Plus,
  Trash2,
  ZoomIn,
  Maximize2
} from 'lucide-react'

// Import Hero and Footer banners statically from the root of frontend
import TopHeroImage from '../../../Top-Of-Ai-Page.jpg'
import BottomImage from '../../../bottom-of-page.jpeg'

const PAPER_SIZES = ['A4', 'A3', 'Banner', 'Square Post']

const SWATCHES = [
  { name: 'Royal Gold', gradient: 'from-amber-500 via-yellow-400 to-amber-600', border: 'border-yellow-300' },
  { name: 'Sunset Glow', gradient: 'from-orange-500 to-rose-500', border: 'border-orange-300' },
  { name: 'Ocean Breeze', gradient: 'from-cyan-500 to-blue-600', border: 'border-cyan-300' },
  { name: 'Midnight Purple', gradient: 'from-indigo-600 to-purple-800', border: 'border-indigo-400' },
  { name: 'Emerald Luxe', gradient: 'from-emerald-600 to-teal-800', border: 'border-emerald-400' }
]

const bgCategories = ['All', 'Festive', 'Corporate', 'Minimalist', 'Creative']

export default function PrintSmartAiPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const [shopName, setShopName] = useState('Default Shop')
  const [toasts, setToasts] = useState([])

  // Feature selector state
  const [activeFeature, setActiveFeature] = useState('poster') // 'poster' | 'banner' | 'flyer' | 'festival' | 'social' | 'whatsapp'

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    businessName: '',
    description: '',
    language: 'English',
    audience: 'General public',
    posterType: 'Poster',
    posterSize: 'A4',
    themeStyle: 'Modern',
    colorPreference: '',
    cta: 'Visit Today'
  })

  // Studio asset state
  const [isGenerating, setIsGenerating] = useState(false)
  const [loadingStep, setLoadingStep] = useState(0)
  const [generatedImageUrl, setGeneratedImageUrl] = useState('')
  const [generatedAssetId, setGeneratedAssetId] = useState('')

  // Autofill state
  const [isSuggesting, setIsSuggesting] = useState(false)

  // Print Queue submission state
  const [isPrinting, setIsPrinting] = useState(false)

  // History state
  const [history, setHistory] = useState([])
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)

  const [creationMethod, setCreationMethod] = useState('manual') // 'manual' | 'chat'
  const [creationType, setCreationType] = useState('Poster')
  const [targetIntent, setTargetIntent] = useState('Sale / Offer')
  const [posterData, setPosterData] = useState({
    headline: '',
    subheadline: '',
    description: '',
    offerText: '',
    cta: '',
    theme: ''
  })
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedBgSwatch, setSelectedBgSwatch] = useState(0)
  const [uploadedRefFile, setUploadedRefFile] = useState(null)
  const [bgRemovedFile, setBgRemovedFile] = useState(null)
  
  const [promptText, setPromptText] = useState('')
  const [chatFiles, setChatFiles] = useState([])
  const [generatedConfig, setGeneratedConfig] = useState(null)
  const [promptHistory, setPromptHistory] = useState([])
  const [errorState, setErrorState] = useState(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const [canvasScale, setCanvasScale] = useState(1)
  
  const [printType, setPrintType] = useState('COLOR')
  const [copies, setCopies] = useState(1)
  const [paperSize, setPaperSize] = useState('A4')
  const [sides, setSides] = useState('SINGLE')
  const [orientation, setOrientation] = useState('PORTRAIT')
  const [quality, setQuality] = useState('NORMAL')

  const [geminiApiKey, setGeminiApiKey] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('gemini_api_key') || ''
      setGeminiApiKey(savedKey)
    }
  }, [])

  const activeSwatchConfig = SWATCHES[selectedBgSwatch] || SWATCHES[0]

  const loadingTexts = [
    "Analyzing business context...",
    "Creating marketing layout...",
    "Generating premium typography...",
    "Applying branding...",
    "Finalizing AI design..."
  ]

  // Add toast notifications
  const addToast = (message, type = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }

  // Load shopkeeper data and previous history
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
        setFormData(prev => ({ ...prev, businessName: account.shopName }))
      }
    } catch {
      // Keep defaults
    }

    fetchHistory()
  }, [router])

  // Fetch past assets
  const fetchHistory = async () => {
    setIsLoadingHistory(true)
    try {
      const token = localStorage.getItem('authToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
      const response = await fetch(`${apiUrl}/api/ai/history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      }
    } catch (error) {
      console.error('History fetch error:', error)
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleZoomIn = () => setCanvasScale(prev => Math.min(prev + 0.1, 2))
  const handleZoomOut = () => setCanvasScale(prev => Math.max(prev - 0.1, 0.5))
  const handleFit = () => setCanvasScale(1)

  const processUploadedFile = (e, callback) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 10 * 1024 * 1024) {
      addToast('File is too large! Max 10MB allowed.', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      callback(event.target.result)
      addToast('File uploaded successfully!', 'success')
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (field, value, maxLength) => {
    const truncatedValue = maxLength ? value.substring(0, maxLength) : value
    setPosterData(prev => ({
      ...prev,
      [field]: truncatedValue
    }))
  }

  const handleCancelAction = () => {
    setPromptText('')
    setChatFiles([])
    addToast('Inputs cleared.', 'info')
  }

  const handleChatGenerate = async (e) => {
    if (e) e.preventDefault()
    if (!promptText.trim()) return

    setIsGenerating(true)
    setLoadingStep(0)
    setGeneratedImageUrl('')
    setErrorState(null)
    addToast('AI auto-configuring parameters...', 'info')

    const stepTimer = setInterval(() => {
      setLoadingStep(prev => (prev < loadingTexts.length - 1 ? prev + 1 : prev))
    }, 3000)

    try {
      const token = localStorage.getItem('authToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
      const response = await fetch(`${apiUrl}/api/ai/chat-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(geminiApiKey ? { 'X-Gemini-API-Key': geminiApiKey } : {})
        },
        body: JSON.stringify({ prompt: promptText, currentConfig: formData })
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error ? `${errData.message} (${errData.error})` : (errData.message || 'AI Chat Generation failed'))
      }

      const result = await response.json()
      
      setGeneratedConfig(result.config)
      setGeneratedImageUrl(result.generatedImageUrl)
      setGeneratedAssetId(result.id)
      
      setPosterData({
        headline: result.config.headline || '',
        subheadline: result.config.subheadline || '',
        description: result.config.description || '',
        offerText: result.config.offerText || '',
        cta: result.config.cta || '',
        theme: result.config.theme || ''
      })
      
      const historyItem = {
        id: result.id || Date.now().toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: promptText,
        result: {
          headline: result.config.headline || '',
          subheadline: result.config.subheadline || '',
          offerText: result.config.offerText || '',
          description: result.config.description || '',
          cta: result.config.cta || '',
          theme: result.config.theme || '',
          swatchIdx: 0,
          swatchName: 'Royal Gold'
        }
      }
      setPromptHistory(prev => [historyItem, ...prev])
      addToast('Poster successfully configured and generated by AI!', 'success')
      fetchHistory()
    } catch (error) {
      console.error('Chat generate error:', error)
      setErrorState(error.message)
      addToast(error.message || 'Failed to auto-configure layout', 'error')
    } finally {
      clearInterval(stepTimer)
      setIsGenerating(false)
    }
  }

  const handleChatFileUpload = (e) => {
    let files = []
    if (e.target && e.target.files) {
      files = Array.from(e.target.files)
    } else if (e.dataTransfer && e.dataTransfer.files) {
      files = Array.from(e.dataTransfer.files)
    }

    if (files.length === 0) return

    const newFiles = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB'
    }))

    setChatFiles(prev => [...prev, ...newFiles])
    addToast(`${files.length} file(s) attached!`, 'success')
  }

  const handleGeneratePoster = (e) => {
    if (e) e.preventDefault()
    handleGenerate(e)
  }

  const handleReset = () => {
    setFormData({
      title: '',
      businessName: shopName,
      description: '',
      language: 'English',
      audience: 'General public',
      posterType: 'Poster',
      posterSize: 'A4',
      themeStyle: 'Modern',
      colorPreference: '',
      cta: 'Visit Today'
    })
    setPosterData({
      headline: '',
      subheadline: '',
      description: '',
      offerText: '',
      cta: '',
      theme: ''
    })
    setGeneratedImageUrl('')
    setGeneratedAssetId('')
    addToast('Configuration settings reset.', 'info')
  }

  const handleSaveConfiguration = () => {
    addToast('Layout configuration saved!', 'success')
  }

  // Handle Tab / Feature selection to preset fields
  const handleFeatureSelect = (featureId, type, size, theme) => {
    setActiveFeature(featureId)
    setFormData(prev => ({
      ...prev,
      posterType: type,
      posterSize: size,
      themeStyle: theme || prev.themeStyle
    }))
    addToast(`Preset fields configured for ${type}!`, 'info')
  }

  // Handle tab selection translation
  const handleTabChange = (tabId, label) => {
    let type = 'Poster'
    let size = 'A4'
    let theme = 'Modern'

    if (tabId === 'flyer') {
      type = 'Flyer'
    } else if (tabId === 'festival') {
      type = 'Festival'
      theme = 'Traditional'
    } else if (tabId === 'social') {
      type = 'Social Media'
      size = 'Square Post'
    }

    handleFeatureSelect(tabId, type, size, theme)
  }

  // Handle "Suggest Prompt"
  const handleSuggestPrompt = async () => {
    if (!formData.title.trim()) {
      addToast('Please enter a Promotion Title first!', 'error')
      return
    }

    setIsSuggesting(true)
    addToast('Google Gemini is generating field suggestions...', 'info')

    try {
      const token = localStorage.getItem('authToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
      const response = await fetch(`${apiUrl}/api/ai/suggest-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(geminiApiKey ? { 'X-Gemini-API-Key': geminiApiKey } : {})
        },
        body: JSON.stringify({ title: formData.title })
      })

      if (!response.ok) {
        let errMsg = 'Failed to fetch suggestions from Gemini API'
        try {
          const errData = await response.json()
          errMsg = errData.error ? `${errData.message} (${errData.error})` : (errData.message || errMsg)
        } catch (_) {}
        throw new Error(errMsg)
      }

      const suggestions = await response.json()
      setFormData(prev => ({
        ...prev,
        description: suggestions.businessDescription || prev.description,
        audience: suggestions.audience || prev.audience,
        themeStyle: suggestions.theme || prev.themeStyle,
        language: suggestions.language || prev.language,
        cta: suggestions.cta || prev.cta,
        posterType: suggestions.posterType || prev.posterType,
        colorPreference: suggestions.colorPalette || prev.colorPreference
      }))

      addToast('Form fields updated by Gemini AI!', 'success')
    } catch (error) {
      console.error('Suggest prompt error:', error)
      addToast(error.message || 'Error occurred during prompt suggestions', 'error')
    } finally {
      setIsSuggesting(false)
    }
  }

  // Handle Generate
  const handleGenerate = async (e) => {
    if (e) e.preventDefault()
    if (!formData.title.trim()) {
      addToast('Title / Business Offer Title is required!', 'error')
      return
    }

    setIsGenerating(true)
    setLoadingStep(0)
    setGeneratedImageUrl('')
    addToast('PrintSmart AI is designing your poster...', 'info')

    // Cycle through loading steps
    const stepTimer = setInterval(() => {
      setLoadingStep(prev => (prev < loadingTexts.length - 1 ? prev + 1 : prev))
    }, 3000)

    try {
      const token = localStorage.getItem('authToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
      const response = await fetch(`${apiUrl}/api/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(geminiApiKey ? { 'X-Gemini-API-Key': geminiApiKey } : {})
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error ? `${errData.message} (${errData.error})` : (errData.message || 'Failed to generate poster'))
      }

      const result = await response.json()
      setGeneratedImageUrl(result.generatedImageUrl)
      setGeneratedAssetId(result.id)
      addToast('Poster successfully generated by PrintSmart AI!', 'success')
      fetchHistory()
    } catch (error) {
      console.error('Generation error:', error)
      addToast(error.message || 'Error occurred during design generation', 'error')
    } finally {
      clearInterval(stepTimer)
      setIsGenerating(false)
    }
  }

  // Handle Regenerate
  const handleRegenerate = async () => {
    setIsGenerating(true)
    setLoadingStep(0)
    setGeneratedImageUrl('')
    addToast('PrintSmart AI is generating a new design variation...', 'info')

    const stepTimer = setInterval(() => {
      setLoadingStep(prev => (prev < loadingTexts.length - 1 ? prev + 1 : prev))
    }, 3000)

    try {
      const token = localStorage.getItem('authToken')
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
      const response = await fetch(`${apiUrl}/api/ai/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(geminiApiKey ? { 'X-Gemini-API-Key': geminiApiKey } : {})
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error ? `${errData.message} (${errData.error})` : (errData.message || 'Failed to regenerate poster'))
      }

      const result = await response.json()
      setGeneratedImageUrl(result.generatedImageUrl)
      setGeneratedAssetId(result.id)
      addToast('New design variation successfully generated!', 'success')
      fetchHistory()
    } catch (error) {
      console.error('Regeneration error:', error)
      addToast(error.message || 'Error occurred during design regeneration', 'error')
    } finally {
      clearInterval(stepTimer)
      setIsGenerating(false)
    }
  }

  // Handle Download (CORS-friendly blob conversion)
  const handleDownload = async () => {
    if (!generatedImageUrl) return
    addToast('Downloading generated design...', 'info')
    try {
      const response = await fetch(generatedImageUrl)
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = `ai-marketing-design-${Date.now()}.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(blobUrl)
      addToast('Download completed!', 'success')
    } catch (error) {
      console.error('Download error:', error)
      window.open(generatedImageUrl, '_blank')
    }
  }

  // Handle Native Share or URL clipboard fallback
  const handleShare = async () => {
    if (!generatedImageUrl) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: `AI Marketing Design: ${formData.title}`,
          text: `Check out this AI-generated marketing design for ${formData.businessName}!`,
          url: generatedImageUrl
        })
        addToast('Shared successfully!', 'success')
      } catch (err) {
        console.warn('Native share failed or dismissed:', err)
      }
    } else {
      try {
        await navigator.clipboard.writeText(generatedImageUrl)
        addToast('Design image URL copied to clipboard!', 'success')
      } catch (err) {
        addToast('Failed to copy link to clipboard.', 'error')
      }
    }
  }

  // Print Now (integrating directly into the active print queue)
  const handlePrintNow = async () => {
    if (!generatedImageUrl) {
      addToast('No generated design available to print!', 'error')
      return
    }

    setIsPrinting(true)
    addToast('Submitting poster print job to queue...', 'info')

    try {
      const token = localStorage.getItem('authToken')
      const account = JSON.parse(localStorage.getItem('shopkeeper') || '{}')
      const shopkeeperId = account.id
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'

      const orderData = {
        userId: null,
        shopkeeperId: shopkeeperId,
        customerName: "AI Studio Walk-in",
        phone: account.phone || "N/A",
        items: [{
          fileName: `AI_Poster_${formData.title.replace(/\s+/g, '_')}.jpg`,
          fileUrl: generatedImageUrl,
          fileSize: 1024 * 1024,
          price: formData.posterSize === 'A3' ? 25.0 : 15.0,
          config: {
            printType: 'COLOR',
            copies: 1,
            paperSize: formData.posterSize || 'A4',
            sides: 'SINGLE',
            orientation: formData.posterSize === 'Banner' ? 'LANDSCAPE' : 'PORTRAIT',
            quality: 'HIGH',
            pageRange: 'all'
          }
        }]
      }

      const response = await fetch(`${apiUrl}/api/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || 'Failed to submit print job')
      }

      addToast('Print job successfully queued and invoice generated!', 'success')
    } catch (error) {
      console.error('Print queue error:', error)
      addToast(error.message || 'Error pushing print job to queue', 'error')
    } finally {
      setIsPrinting(false)
    }
  }

  // Load design from History shelf
  const handleSelectHistoryItem = (item) => {
    setGeneratedImageUrl(item.generatedImageUrl)
    setGeneratedAssetId(item.id)
    setFormData(prev => ({
      ...prev,
      title: item.title,
      posterType: item.type
    }))
    addToast(`Loaded design: "${item.title}"`, 'info')
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

      {/* Header and Branding Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/shopkeeper/dashboard')}
            className="mr-3 p-2 hover:bg-slate-100 rounded-xl transition text-slate-600 flex items-center justify-center"
            title="Back to Dashboard"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
          </button>

          <div className="bg-[#6366F1]/10 p-2 rounded-xl text-[#6366F1]">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <span className="text-xl font-brand tracking-tight text-[#1A1A1A] font-black">AI Marketing Studio</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-full px-3.5 py-1.5 text-xs font-bold text-[#6366F1]">
            <span>Shop Pro</span>
          </div>
          <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-2.5 py-1.5 bg-slate-50">
            <Settings size={14} className="text-slate-500 animate-spin-slow" />
            <input
              type="password"
              placeholder="Gemini API Key..."
              value={geminiApiKey}
              onChange={(e) => {
                const val = e.target.value
                setGeminiApiKey(val)
                localStorage.setItem('gemini_api_key', val)
              }}
              className="text-[10px] bg-transparent border-none outline-none font-mono w-28 text-slate-700 placeholder-slate-400 focus:ring-0 focus:outline-none"
              title="Add client-side Gemini API key to override backend setting"
            />
          </div>
          <span className="text-xs font-bold text-[#64748B]">Active Shop: {shopName}</span>
          <div className="h-9 w-9 rounded-full bg-[#6366F1] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            SP
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Top Hero Image Banner */}
        <div className="w-full relative rounded-3xl overflow-hidden shadow-sm border border-slate-200 bg-white">
          <img
            src={TopHeroImage.src}
            alt="PrintSmart AI Studio Hero Banner"
            className="w-full h-auto object-cover max-h-[220px]"
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
            const isActive = activeFeature === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id, tab.label)}
                className={`p-5 rounded-2xl border text-left transition-all ${isActive
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
            <span className="text-sm font-extrabold">Manual Creation</span>
            <span className="text-[10px] text-slate-400 font-normal mt-0.5">Configure print layouts step-by-step manually</span>
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
            <span className="text-sm font-extrabold">Chat Prompting</span>
            <span className="text-[10px] text-slate-400 font-normal mt-0.5">Generate prints and layouts using natural prompts</span>
          </button>
        </div>

        {/* Split Layout Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">

          {/* Left Panel: Configuration Form */}
          <div className="lg:col-span-7 space-y-6">

            {/* PANEL A: MANUAL CREATION COMPONENT */}
            {creationMethod === 'manual' && (
              <form
                onSubmit={handleGeneratePoster}
                className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h2 className="text-lg font-bold text-[#1A1A1A]">
                    Tell us about what you want to create
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="text-xs font-bold text-[#6366F1] hover:text-[#8B5CF6] transition flex items-center gap-1.5"
                    >
                      <RotateCcw size={12} />
                      <span>Reset Form</span>
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
                              className={`py-3 px-2 rounded-xl text-xs font-bold border transition ${isActive
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
                              className={`py-2 px-3.5 rounded-full text-xs font-bold border transition ${isActive
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
                        <label className="block text-sm font-bold text-[#1A1A1A]">Main Heading (Headline)</label>
                        <span className="text-[10px] font-bold text-slate-400">
                          {(posterData.headline || '').length}/100
                        </span>
                      </div>
                      <input
                        type="text"
                        value={posterData.headline}
                        onChange={(e) => handleInputChange('headline', e.target.value, 100)}
                        placeholder="Enter main headline text"
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
                        <label className="block text-sm font-bold text-[#1A1A1A]">Sub Heading (Subheadline)</label>
                        <span className="text-[10px] font-bold text-slate-400">
                          {(posterData.subheadline || '').length}/100
                        </span>
                      </div>
                      <input
                        type="text"
                        value={posterData.subheadline}
                        onChange={(e) => handleInputChange('subheadline', e.target.value, 100)}
                        placeholder="Enter subheadline text"
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
                          Description (Details to display on the poster)
                        </label>
                        <span className="text-[10px] font-bold text-slate-400">
                          {(posterData.description || '').length}/500
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={posterData.description}
                        onChange={(e) => handleInputChange('description', e.target.value, 500)}
                        placeholder="Describe details for AI poster layout"
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
                          <label className="block text-xs font-bold text-[#1A1A1A]">Offer Text</label>
                          <span className="text-[10px] font-bold text-slate-400">
                            {(posterData.offerText || '').length}/50
                          </span>
                        </div>
                        <input
                          type="text"
                          value={posterData.offerText}
                          onChange={(e) => handleInputChange('offerText', e.target.value, 50)}
                          placeholder="e.g. 50% OFF / Buy 1 Get 1"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-bold text-[#1A1A1A]">Call to Action (CTA)</label>
                          <span className="text-[10px] font-bold text-slate-400">
                            {(posterData.cta || '').length}/50
                          </span>
                        </div>
                        <input
                          type="text"
                          value={posterData.cta}
                          onChange={(e) => handleInputChange('cta', e.target.value, 50)}
                          placeholder="e.g. Order Now / Register Today"
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

                  {/* STEP 8: Print Layout Configuration Controls (Unified layout) */}
                  <div className="flex gap-4 items-start pt-2 border-t border-slate-100">
                    <div className="flex-shrink-0 h-7 w-7 rounded-full bg-indigo-50 text-[#6366F1] font-bold text-sm flex items-center justify-center border border-indigo-100">
                      8
                    </div>
                    <div className="flex-1 space-y-4">
                      <label className="block text-sm font-bold text-[#1A1A1A]">Print Layout Configuration</label>

                      {/* Print Type */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-500">Print Color Mode</span>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => { setPrintType('BW'); addToast('Set manual print to Black & White', 'info') }}
                            className={`py-2.5 px-4 rounded-xl font-bold text-xs transition border-2 ${printType === 'BW'
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                          >
                            Black &amp; White
                          </button>
                          <button
                            type="button"
                            onClick={() => { setPrintType('COLOR'); addToast('Set manual print to Color', 'info') }}
                            className={`py-2.5 px-4 rounded-xl font-bold text-xs transition border-2 ${printType === 'COLOR'
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                          >
                            🎨 Color Print
                          </button>
                        </div>
                      </div>

                      {/* Copies control */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-500">Print Copies (Quantity)</span>
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
                        <span className="text-xs font-bold text-slate-500">Paper Sizing Option</span>
                        <select
                          value={paperSize}
                          onChange={(e) => setPaperSize(e.target.value)}
                          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 text-slate-800 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {PAPER_SIZES.map(size => (
                            <option key={size} value={size}>{size}</option>
                          ))}
                        </select>
                      </div>

                      {/* Sides Duplex selection */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-bold text-slate-500">Print Duplex Sides</span>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setSides('SINGLE')}
                            className={`py-2.5 px-4 rounded-xl font-bold text-xs transition border-2 ${sides === 'SINGLE'
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                          >
                            Single-sided
                          </button>
                          <button
                            type="button"
                            onClick={() => setSides('DOUBLE')}
                            className={`py-2.5 px-4 rounded-xl font-bold text-xs transition border-2 ${sides === 'DOUBLE'
                              ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                              }`}
                          >
                            Double-sided
                          </button>
                        </div>
                      </div>

                      {/* Orientation & Print Quality */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-slate-500">Layout Orientation</span>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setOrientation('PORTRAIT')}
                              className={`py-2 px-1 rounded-lg font-bold text-[10px] transition border-2 text-center flex items-center justify-center gap-1 ${orientation === 'PORTRAIT'
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                }`}
                            >
                              Portrait
                            </button>
                            <button
                              type="button"
                              onClick={() => setOrientation('LANDSCAPE')}
                              className={`py-2 px-1 rounded-lg font-bold text-[10px] transition border-2 text-center flex items-center justify-center gap-1 ${orientation === 'LANDSCAPE'
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                }`}
                            >
                              Landscape
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-xs font-bold text-slate-500">Print Quality Output</span>
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
                                {q}
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
                          <span>Reset</span>
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
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={14} className="text-yellow-200 animate-pulse" />
                              <span>Generate Poster</span>
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
                      <h2 className="text-base font-bold text-[#1A1A1A]">AI Conversational Prompting</h2>
                      <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Describe what you want to create and let AI configure it</p>
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
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Try these example prompts</label>
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
                    <label className="block text-sm font-bold text-[#1A1A1A]">What are you printing today?</label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder='Describe your print job requirements (e.g. "Print 50 copies of A4 size wedding invitation cards, double-sided, color mode, with golden festive theme...")'
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
                    <label className="block text-sm font-bold text-[#1A1A1A]">Upload Supporting Files (Optional)</label>

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
                      <div className="text-xs font-extrabold text-slate-800">Drag & Drop Files Here</div>
                      <div className="text-[10px] font-bold text-slate-400 mt-1">or Click to Browse (PDF, Word, Images up to 10MB)</div>
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
                      <span>Cancel</span>
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
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} className="text-yellow-200 animate-pulse" />
                          <span>Generate Design</span>
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
                        <span className="text-xs font-bold text-indigo-800">Active AI Print Configuration</span>
                      </div>
                      <button
                        onClick={() => {
                          setGeneratedConfig(null)
                          addToast('AI configuration preview cleared.', 'info')
                        }}
                        className="text-[10px] font-bold text-slate-400 hover:text-slate-600 transition"
                      >
                        Clear Card
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-400 font-bold block mb-0.5">Copies Count</span>
                        <span className="font-extrabold text-slate-800 text-sm">{(generatedConfig.headline || '').substring(0, 35)}...</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-400 font-bold block mb-0.5">Offer Text</span>
                        <span className="font-extrabold text-slate-800 text-xs">
                          {generatedConfig.offerText || 'N/A'}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-400 font-bold block mb-0.5">CTA Button</span>
                        <span className="font-extrabold text-slate-800 text-xs">{generatedConfig.cta || 'N/A'}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100">
                        <span className="text-slate-400 font-bold block mb-0.5">Subheadline</span>
                        <span className="font-extrabold text-slate-800 text-[10px] block truncate">
                          {generatedConfig.subheadline || 'N/A'}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-slate-100 col-span-2 flex justify-between items-center">
                        <div>
                          <span className="text-slate-400 font-bold block mb-0.5">Theme &amp; Details</span>
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
                          <span>Tweak Manually</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Prompt History List */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prompt Generation History</h3>

                  {promptHistory.length === 0 ? (
                    <div className="text-center py-6 border border-slate-100 rounded-2xl bg-slate-50/50">
                      <p className="text-xs font-semibold text-slate-400">No prompts generated yet. Start prompting above!</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {promptHistory.map((item) => (
                        <div key={item.id} className="p-3 border border-slate-100 bg-slate-50 rounded-xl space-y-2 hover:bg-slate-100/50 transition">
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold text-[#6366F1] bg-[#6366F1]/10 px-2 py-0.5 rounded-md font-brand">AI Poster Generated</span>
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
                              <span>Apply to Panel</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPromptHistory(prev => prev.filter(p => p.id !== item.id))
                                addToast('History entry deleted.', 'info')
                              }}
                              className="text-[10px] font-extrabold text-slate-400 hover:text-rose-600 transition"
                            >
                              Delete
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
                <h3 className="text-sm font-bold text-slate-800">Quick Configuration Actions</h3>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Manage generation outputs instantly</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="py-2 px-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs shadow-sm transition"
                >
                  Reset Settings
                </button>
                <button
                  type="button"
                  onClick={handleSaveConfiguration}
                  className="py-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-sm transition"
                >
                  Save Layout
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT SIDE: PREVIEW PANEL (Sticky on desktop, scrollable internally) */}
          <div className="lg:col-span-5 lg:sticky lg:top-[90px] lg:h-[calc(100vh-130px)] lg:overflow-y-auto pr-1 space-y-4 pb-6">
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <h2 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-1.5">
                <Sliders size={16} className="text-[#6366F1]" />
                <span>Live Studio Canvas</span>
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
                  <span>Fit</span>
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

                {/* Preview Panel States */}
                {!generatedImageUrl && !isGenerating && (
                  <div className="flex flex-col items-center justify-center p-8 text-center min-h-[480px] border-2 border-dashed border-slate-200 rounded-[28px] bg-slate-50/50">
                    <div className="p-4 bg-indigo-50 text-indigo-500 rounded-full mb-4 animate-bounce">
                      <Sparkles size={32} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">Your AI-generated design will appear here</h3>
                    <p className="text-[10px] font-bold text-slate-500 mt-1 max-w-[240px] leading-relaxed">
                      Enter your business offer title and click "Generate" to construct a completely custom, professional flyer.
                    </p>
                  </div>
                )}

                {isGenerating && (
                  <div className="flex flex-col items-center justify-center p-8 text-center min-h-[480px] border border-slate-200 rounded-[28px] bg-white shadow-sm space-y-4">
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-24 h-24 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
                      <Sparkles size={32} className="text-indigo-600 animate-pulse" />
                    </div>
                    <div className="space-y-2 pt-4">
                      <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest animate-pulse">
                        AI Agent Designing
                      </h3>
                      <p className="text-xs font-bold text-slate-700">
                        {loadingTexts[loadingStep]}
                      </p>
                    </div>
                    {/* Step indicators */}
                    <div className="flex justify-center gap-1.5 pt-2">
                      {loadingTexts.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${idx <= loadingStep ? 'bg-indigo-600 w-3' : 'bg-slate-200'
                            }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {generatedImageUrl && !isGenerating && (
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-full relative overflow-hidden bg-slate-100 border border-slate-200 rounded-[28px] flex items-center justify-center p-2 shadow-sm min-h-[480px]">
                      <img
                        src={generatedImageUrl}
                        alt="AI Generated Marketing Design"
                        className="max-h-[500px] w-auto object-contain rounded-2xl shadow-md"
                      />
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1">
                        <Sparkles size={10} className="text-yellow-400" />
                        <span>✨ Generated by AI</span>
                      </div>
                    </div>

                    {/* Processing Overlay loader spinner */}
                    {isGenerating && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex flex-col items-center justify-center text-white gap-2 transition-all">
                        <Loader2 size={36} className="animate-spin text-[#6366F1]" />
                        <span className="text-xs font-black tracking-widest text-[#F8F7FF] uppercase">AI Generating...</span>
                      </div>
                    )}
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
                  <span>Download</span>
                </button>
                <button
                  onClick={handleShare}
                  type="button"
                  className="flex items-center justify-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 py-3 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition active:scale-95"
                >
                  <Share2 size={14} />
                  <span>Share</span>
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
                    <span>Configure</span>
                  </button>
                ) : (
                  <button
                    onClick={handleGeneratePoster}
                    type="button"
                    className="flex items-center justify-center gap-1.5 bg-indigo-50 border border-indigo-100 text-[#6366F1] hover:bg-indigo-100 py-3 rounded-xl text-xs font-bold shadow-sm transition active:scale-95"
                  >
                    <RotateCcw size={14} />
                    <span>Refresh</span>
                  </button>
                )}
              </div>

              {/* Base Footnote Tip Banner */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 flex items-start gap-2.5 shadow-sm">
                <span className="text-yellow-500 mt-0.5">💡</span>
                <p className="text-xs font-semibold text-indigo-950 leading-relaxed">
                  AI Tip: Switch between creation styles above. Conversational prompt generation uses real Groq AI processing to prefill configuration settings!
                </p>
              </div>
            </div>

          </div>

          {/* Responsive Footer Image Banner */}
          <div className="w-full mt-8 rounded-3xl overflow-hidden shadow-sm border border-slate-200 bg-white">
            <img
              src={BottomImage.src}
              alt="PrintSmart AI Features Bottom Banner"
              className="w-full h-auto object-cover"
            />
          </div>

          {/* Instructional Discovery Dock */}
          <div className="bg-white border border-slate-200 rounded-[28px] p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-[#6366F1] pb-4 border-b border-slate-100">
              <HelpCircle size={20} />
              <h2 className="text-base font-bold text-[#1A1A1A]">How PrintSmart AI works?</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="flex gap-3 items-start">
                <div className="p-2.5 rounded-xl bg-violet-50 text-[#8B5CF6] flex-shrink-0">
                  <Grid size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A1A]">1. Choose Creation Method</h3>
                  <p className="text-xs text-[#64748B] font-semibold mt-1">Configure layout options manually or converse using AI prompting</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-2.5 rounded-xl bg-violet-50 text-[#8B5CF6] flex-shrink-0">
                  <ClipboardCheck size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A1A]">2. Attach Files &amp; Details</h3>
                  <p className="text-xs text-[#64748B] font-semibold mt-1">Provide sample attachments or descriptions to assist the generation process</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-2.5 rounded-xl bg-violet-50 text-[#8B5CF6] flex-shrink-0">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A1A]">3. AI Computes Layout</h3>
                  <p className="text-xs text-[#64748B] font-semibold mt-1">AI engine parses parameters, matches colors, and renders typography instantly</p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <div className="p-2.5 rounded-xl bg-violet-50 text-[#8B5CF6] flex-shrink-0">
                  <Download size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#1A1A1A]">4. Instant Download</h3>
                  <p className="text-xs text-[#64748B] font-semibold mt-1">Download your high-resolution layout and proceed to printing queues</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-Footer Credits */}
          <div className="text-center text-xs font-bold text-[#64748B] pt-4">
            Powered by PrintSmart AI  •  Made for Indian Print Shops 💜
          </div>

      </main>
    </div>
  )
}

function MandalaPattern() {
  return (
    <div className="absolute inset-0 opacity-10 pointer-events-none flex items-center justify-center">
      <svg className="w-64 h-64 text-yellow-200 animate-spin-slow" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
        <circle cx="50" cy="50" r="40" />
        <circle cx="50" cy="50" r="30" />
        <circle cx="50" cy="50" r="20" />
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1="50"
            y1="50"
            x2={50 + 40 * Math.cos((i * Math.PI) / 6)}
            y2={50 + 40 * Math.sin((i * Math.PI) / 6)}
          />
        ))}
      </svg>
    </div>
  )
}
