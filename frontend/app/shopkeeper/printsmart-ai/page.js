'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Settings
} from 'lucide-react'

// Import Hero and Footer banners statically from the root of frontend
import TopHeroImage from '../../../Top-Of-Ai-Page.jpg'
import BottomImage from '../../../bottom-of-page.jpeg'

const PAPER_SIZES = ['A4', 'A3', 'Banner', 'Square Post']

export default function PrintSmartAiPage() {
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/ai/suggest-prompt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ title: formData.title })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch suggestions from Gemini API')
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || 'Failed to generate poster')
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/ai/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || 'Failed to regenerate poster')
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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

        {/* Marketing Cards Selection Shelf */}
        <div className="space-y-3">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest">Select AI Marketing Tool</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
            {[
              { id: 'poster', label: 'AI Poster Maker', icon: ImageIcon, type: 'Poster', size: 'A4', desc: 'Design stunning A4 flyers & posters' },
              { id: 'banner', label: 'AI Banner Maker', icon: Sliders, type: 'Banner', size: 'Banner', desc: 'Sleek banners for web & outdoor' },
              { id: 'flyer', label: 'Offer Flyer Generator', icon: Percent, type: 'Flyer', size: 'A4', desc: 'Perfect handouts and pamphlets' },
              { id: 'festival', label: 'Festival Marketing', icon: Flame, type: 'Poster', size: 'A4', theme: 'Festival', desc: 'Festive branding designs' },
              { id: 'social', label: 'Social Media Maker', icon: ThumbsUp, type: 'Social Media Post', size: 'Square Post', desc: 'Digital social square posts' },
              { id: 'whatsapp', label: 'WhatsApp Promoter', icon: Send, type: 'WhatsApp Promotion', size: 'Square Post', desc: 'WhatsApp status templates' }
            ].map((feature) => {
              const IconComp = feature.icon
              const isActive = activeFeature === feature.id
              return (
                <button
                  key={feature.id}
                  type="button"
                  onClick={() => handleFeatureSelect(feature.id, feature.type, feature.size, feature.theme)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between min-h-[140px] ${isActive
                    ? 'border-[#6366F1] bg-white ring-2 ring-[#6366F1]/20 shadow-md scale-[1.02]'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm hover:scale-[1.01]'
                    }`}
                >
                  <div className={`p-2 rounded-lg w-fit ${isActive ? 'bg-[#6366F1] text-white' : 'bg-slate-100 text-[#64748B]'}`}>
                    <IconComp size={16} />
                  </div>
                  <div>
                    <div className="mt-3 font-bold text-xs text-[#1A1A1A] leading-snug">{feature.label}</div>
                    <div className="text-[10px] text-[#64748B] mt-1 leading-normal font-medium">{feature.desc}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Split Layout Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">

          {/* Left Panel: Configuration Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleGenerate} className="rounded-[24px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-[#1A1A1A] flex items-center gap-1.5">
                  <Sliders size={18} className="text-[#6366F1]" />
                  <span>Poster Parameters</span>
                </h2>
                <span className="text-[10px] font-bold bg-indigo-50 text-[#6366F1] px-2.5 py-1 rounded-md">
                  Active Asset Type: {formData.posterType} ({formData.posterSize})
                </span>
              </div>

              {/* Title / Offer Title (Required) */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Business Offer Title *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder='e.g., "20% OFF Color Printing" or "Exam Printing Offer"'
                    className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
                  />
                  <button
                    type="button"
                    onClick={handleSuggestPrompt}
                    disabled={isSuggesting || isGenerating}
                    className="px-4 py-3 bg-[#6366F1] hover:bg-[#5053db] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 whitespace-nowrap disabled:opacity-50"
                  >
                    {isSuggesting ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} className="text-yellow-200 animate-pulse" />
                    )}
                    <span>Suggest Prompt</span>
                  </button>
                </div>
              </div>

              {/* Grid for Business Name & Language */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Business Name</label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                    placeholder="Your Shop / Brand Name"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Language</label>
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20"
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                    <option value="Marathi">Marathi</option>
                    <option value="Gujarati">Gujarati</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Offer Description */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Offer Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Details to show on poster (e.g. premium A4 color prints, students only...)"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1] resize-none"
                />
              </div>

              {/* Target Audience & Theme Style */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Audience</label>
                  <input
                    type="text"
                    value={formData.audience}
                    onChange={(e) => setFormData(prev => ({ ...prev, audience: e.target.value }))}
                    placeholder="e.g. Students, Wedding Customers"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Theme Style</label>
                  <select
                    value={formData.themeStyle}
                    onChange={(e) => setFormData(prev => ({ ...prev, themeStyle: e.target.value }))}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#1A1A1A] focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20"
                  >
                    <option value="Modern">Modern</option>
                    <option value="Premium">Premium</option>
                    <option value="Minimal">Minimal</option>
                    <option value="Festival">Festival</option>
                    <option value="Vibrant">Vibrant</option>
                    <option value="Student Friendly">Student Friendly</option>
                  </select>
                </div>
              </div>

              {/* Color Preference & Call To Action Text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">Color Preference</label>
                  <input
                    type="text"
                    value={formData.colorPreference}
                    onChange={(e) => setFormData(prev => ({ ...prev, colorPreference: e.target.value }))}
                    placeholder='e.g. "Purple + White", "Vibrant Red"'
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[#1A1A1A] uppercase tracking-wider">CTA Button Text</label>
                  <input
                    type="text"
                    value={formData.cta}
                    onChange={(e) => setFormData(prev => ({ ...prev, cta: e.target.value }))}
                    placeholder='e.g. "Order Now", "Print Today"'
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-[#1A1A1A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6366F1]/20 focus:border-[#6366F1]"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <p className="text-[10px] text-slate-400 font-bold max-w-[200px]">
                  Requires Gemini API Key in your backend .env file.
                </p>
                <button
                  type="submit"
                  disabled={isGenerating}
                  style={{ background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)' }}
                  className="px-6 py-3.5 text-white font-extrabold text-xs rounded-xl shadow-lg hover:brightness-105 active:scale-[0.99] transition transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
            </form>

            {/* Generated Design History shelf */}
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                <ClipboardCheck size={14} className="text-[#6366F1]" />
                <span>AI Poster Archive</span>
              </h3>

              {isLoadingHistory ? (
                <div className="flex justify-center items-center py-6 text-slate-400">
                  <Loader2 size={20} className="animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-6 border border-slate-100 rounded-2xl bg-slate-50/50">
                  <p className="text-xs font-bold text-slate-400">No generated designs found. Make your first poster above!</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-h-56 overflow-y-auto pr-1">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectHistoryItem(item)}
                      className="group border border-slate-100 bg-slate-50 hover:bg-indigo-50/30 hover:border-indigo-200 p-2 rounded-xl text-left transition-all duration-200 flex flex-col justify-between space-y-2 relative"
                    >
                      <div className="w-full aspect-[3/4] bg-slate-200 rounded-lg overflow-hidden border border-slate-100 shadow-sm relative">
                        <img
                          src={item.generatedImageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      </div>
                      <div className="w-full min-w-0">
                        <div className="text-[10px] font-black text-slate-800 truncate leading-none mb-0.5">{item.title}</div>
                        <div className="text-[8px] font-bold text-slate-400 uppercase leading-none">{item.type}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: AI Preview Display Canvas */}
          <div className="lg:col-span-5 lg:sticky lg:top-[90px] lg:h-[calc(100vh-130px)] lg:overflow-y-auto pr-1 space-y-4 pb-6">
            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
              <h2 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-1.5">
                <Sparkles size={16} className="text-[#6366F1]" />
                <span>Marketing Preview</span>
              </h2>
              <span className="text-[10px] font-bold text-slate-400">
                Studio View
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

                {/* Button Groups */}
                <div className="grid grid-cols-2 gap-3 w-full">
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
                  <button
                    onClick={handleRegenerate}
                    type="button"
                    className="flex items-center justify-center gap-1.5 bg-indigo-50 border border-indigo-100 text-[#6366F1] hover:bg-indigo-100 py-3 rounded-xl text-xs font-bold shadow-sm transition active:scale-95 col-span-2"
                  >
                    <RefreshCw size={14} className="animate-spin-slow" />
                    <span>Regenerate</span>
                  </button>
                  <button
                    onClick={handlePrintNow}
                    disabled={isPrinting}
                    type="button"
                    style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                    className="flex items-center justify-center gap-1.5 text-white py-3.5 rounded-xl text-xs font-extrabold shadow-md transition active:scale-95 disabled:opacity-50 col-span-2"
                  >
                    <Play size={14} className="fill-white" />
                    <span>{isPrinting ? 'Printing...' : 'Print Now'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Base Footnote Tip Banner */}
            <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 flex items-start gap-2.5 shadow-sm">
              <span className="text-yellow-500 mt-0.5">💡</span>
              <p className="text-xs font-semibold text-indigo-950 leading-relaxed">
                Tip: Enter only your Promotion Title and hit "Suggest Prompt" to let Gemini AI autofill your flyer fields with high-converting marketing content!
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
            <h2 className="text-base font-bold text-[#1A1A1A]">How AI Marketing Studio Works?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex gap-3 items-start">
              <div className="p-2.5 rounded-xl bg-violet-50 text-[#8B5CF6] flex-shrink-0">
                <Grid size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">1. Select Marketing Type</h3>
                <p className="text-xs text-[#64748B] font-semibold mt-1">Pick between Posters, Banners, Flyers, and Social Media templates</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-2.5 rounded-xl bg-violet-50 text-[#8B5CF6] flex-shrink-0">
                <ClipboardCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">2. Suggest Prompt (AI)</h3>
                <p className="text-xs text-[#64748B] font-semibold mt-1">Provide a simple title, click suggest, and watch AI intelligent text fill the form</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-2.5 rounded-xl bg-violet-50 text-[#8B5CF6] flex-shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">3. AI Generates Poster</h3>
                <p className="text-xs text-[#64748B] font-semibold mt-1">Gemini optimizes your prompt, Stable DiffusionXL designs, and the canvas updates</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-2.5 rounded-xl bg-violet-50 text-[#8B5CF6] flex-shrink-0">
                <Download size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1A1A1A]">4. Queue &amp; Print Now</h3>
                <p className="text-xs text-[#64748B] font-semibold mt-1">Send your high-res generated asset directly to your active shop printer queue</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sub-Footer Credits */}
        <div className="text-center text-xs font-bold text-[#64748B] pt-4">
          Powered by Google Gemini &amp; PrintSmart AI Studio 💜
        </div>

      </main>
    </div>
  )
}
