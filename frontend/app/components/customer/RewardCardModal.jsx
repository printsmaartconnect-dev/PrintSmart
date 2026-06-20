'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Clock, Sparkles, Printer, Percent, Moon, Lightbulb, Gift } from 'lucide-react'
import useTranslation from '../../../src/hooks/useTranslation'

const REWARDS = [
  {
    id: 1,
    type: "free_print",
    category: "monetary",
    statusTag: "🎉 Congratulations!",
    badgeText: "YOU WON",
    message: "1 FREE PRINT",
    description: "You got 1 free print on your next order.",
    footerText: "Valid for 7 days",
    icon: Printer,
    themeColor: "green",
    gradientClass: "from-emerald-400 to-green-500",
    bgLight: "bg-emerald-50",
    borderClass: "border-emerald-200",
    textClass: "text-emerald-700",
    tagClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
    buttonText: "Redeem",
    buttonClass: "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200"
  },
  {
    id: 2,
    type: "discount",
    category: "monetary",
    statusTag: "🎉 Congratulations!",
    badgeText: "YOU WON",
    message: "50% OFF",
    description: "You got 50% off on your next order.",
    footerText: "Valid for 7 days",
    icon: Percent,
    themeColor: "blue",
    gradientClass: "from-blue-400 to-indigo-500",
    bgLight: "bg-blue-50",
    borderClass: "border-blue-200",
    textClass: "text-blue-700",
    tagClass: "bg-blue-100 text-blue-800 border-blue-200",
    buttonText: "Claim",
    buttonClass: "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200"
  },
  {
    id: 3,
    type: "astrology",
    category: "non-monetary",
    statusTag: "🔮 Astrology Insight",
    badgeText: "TODAY'S INSIGHT",
    message: "Good Things Ahead",
    description: "Today is a lucky day for you. Stay positive and focused!",
    footerText: "Keep shining bright",
    icon: Moon,
    themeColor: "purple",
    gradientClass: "from-purple-400 to-violet-500",
    bgLight: "bg-purple-50",
    borderClass: "border-purple-200",
    textClass: "text-purple-700",
    tagClass: "bg-purple-100 text-purple-800 border-purple-200",
    buttonText: "Thanks!",
    buttonClass: "bg-purple-600 hover:bg-purple-700 hover:shadow-purple-200"
  },
  {
    id: 4,
    type: "fact",
    category: "non-monetary",
    statusTag: "💡 Did You Know?",
    badgeText: "USEFUL INFO",
    message: "Scholarship Alert",
    description: "Many scholarships are available for students in your state. Check and apply now!",
    footerText: "Education is key",
    icon: Lightbulb,
    themeColor: "orange",
    gradientClass: "from-amber-400 to-orange-500",
    bgLight: "bg-orange-50",
    borderClass: "border-orange-200",
    textClass: "text-orange-700",
    tagClass: "bg-orange-100 text-orange-800 border-orange-200",
    buttonText: "Got It",
    buttonClass: "bg-orange-500 hover:bg-orange-600 hover:shadow-orange-200"
  }
]

export default function RewardCardModal({ orderId, onClose, onRewardApplied }) {
  const { t } = useTranslation()
  const [reward, setReward] = useState(null)
  const [dbReward, setDbReward] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [scratchRevealed, setScratchRevealed] = useState(false)
  const [isScratching, setIsScratching] = useState(false)
  const canvasRef = useRef(null)
  const confettiCanvasRef = useRef(null)
  const animationFrameId = useRef(null)
  const sparklesRef = useRef([])

  // Load reward details from database
  useEffect(() => {
    if (!orderId) {
      setError("No Order ID provided")
      setLoading(false)
      return
    }

    const fetchReward = async () => {
      setLoading(true)
      setError(null)
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
        const response = await fetch(`${apiUrl}/api/rewards/order/${orderId}`)
        if (!response.ok) {
          throw new Error('Failed to load scratch card details')
        }
        const data = await response.json()
        setDbReward(data)
        if (data) {
          setScratchRevealed(data.scratched)
          
          // Map DB reward type to UI reward details
          let uiReward = null
          if (data.rewardType === 'FREE_PRINT') {
            uiReward = {
              type: "free_print",
              category: "monetary",
              statusTag: "🎉 Congratulations!",
              badgeText: "YOU WON",
              message: "1 FREE PRINT",
              description: data.rewardMessage || "You won 1 Free Black & White print page!",
              footerText: "Reward applied automatically",
              icon: Printer,
              themeColor: "green",
              gradientClass: "from-emerald-400 to-green-500",
              bgLight: "bg-emerald-50",
              borderClass: "border-emerald-200",
              textClass: "text-emerald-700",
              tagClass: "bg-emerald-100 text-emerald-800 border-emerald-200",
              buttonText: "Awesome!",
              buttonClass: "bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200"
            }
          } else if (data.rewardType === 'DISCOUNT_50' || data.rewardType === 'HALF_PRICE_COLOR') {
            uiReward = {
              type: "discount",
              category: "monetary",
              statusTag: "🎉 Congratulations!",
              badgeText: "YOU WON",
              message: "50% OFF",
              description: data.rewardMessage || "You got a 50% discount on your print order!",
              footerText: "Reward applied automatically",
              icon: Percent,
              themeColor: "blue",
              gradientClass: "from-blue-400 to-indigo-500",
              bgLight: "bg-blue-50",
              borderClass: "border-blue-200",
              textClass: "text-blue-700",
              tagClass: "bg-blue-100 text-blue-800 border-blue-200",
              buttonText: "Awesome!",
              buttonClass: "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200"
            }
          } else if (data.rewardType === 'ASTROLOGY') {
            let desc = data.rewardMessage;
            let sub = "Cosmic Advice";
            let cat = "🔮 Astrology Insight";
            if (data.rewardMessage && data.rewardMessage.startsWith('{')) {
              try {
                const parsed = JSON.parse(data.rewardMessage);
                desc = parsed.scratch_text || parsed.scratchtext || parsed.scratchText || parsed.message || parsed.description || data.rewardMessage;
                sub = parsed.type || parsed.sub_category || parsed.subcategory || parsed.subCategory || sub;
                cat = parsed.category ? `🔮 ${parsed.category}` : cat;
              } catch (e) {
                console.error("Failed parsing astrology rewardMessage JSON:", e);
              }
            }
            uiReward = {
              type: "astrology",
              category: "non-monetary",
              statusTag: cat,
              badgeText: "TODAY'S INSIGHT",
              message: sub,
              description: desc,
              footerText: "Keep shining bright",
              icon: Moon,
              themeColor: "purple",
              gradientClass: "from-purple-400 to-violet-500",
              bgLight: "bg-purple-50",
              borderClass: "border-purple-200",
              textClass: "text-purple-700",
              tagClass: "bg-purple-100 text-purple-800 border-purple-200",
              buttonText: "Thanks!",
              buttonClass: "bg-purple-600 hover:bg-purple-700 hover:shadow-purple-200"
            }
          } else { // DID_YOU_KNOW
            let desc = data.rewardMessage;
            let sub = "Fun Fact";
            let cat = "💡 Did You Know?";
            let refLink = null;
            let srcName = "";
            if (data.rewardMessage && data.rewardMessage.startsWith('{')) {
              try {
                const parsed = JSON.parse(data.rewardMessage);
                desc = parsed.scratch_text || parsed.scratchtext || parsed.scratchText || parsed.message || parsed.description || data.rewardMessage;
                sub = parsed.sub_category || parsed.subcategory || parsed.subCategory || parsed.type || sub;
                cat = parsed.category ? `💡 ${parsed.category}` : cat;
                refLink = parsed.reference_link || parsed.referencelink || parsed.referenceLink || parsed.link || null;
                srcName = parsed.source_name || parsed.sourcename || parsed.sourceName || parsed.source || refLink || "";
              } catch (e) {
                console.error("Failed parsing did_you_know rewardMessage JSON:", e);
              }
            }
            uiReward = {
              type: "fact",
              category: "non-monetary",
              statusTag: cat,
              badgeText: "USEFUL INFO",
              message: sub,
              description: desc,
              referenceLink: refLink,
              sourceName: srcName,
              footerText: "Knowledge is power",
              icon: Lightbulb,
              themeColor: "orange",
              gradientClass: "from-amber-400 to-orange-500",
              bgLight: "bg-orange-50",
              borderClass: "border-orange-200",
              textClass: "text-orange-700",
              tagClass: "bg-orange-100 text-orange-800 border-orange-200",
              buttonText: "Got It",
              buttonClass: "bg-orange-500 hover:bg-orange-600 hover:shadow-orange-200"
            }
          }
          setReward(uiReward)
        } else {
          setError("No reward card is available for this order.")
        }
      } catch (err) {
        console.error("Error fetching reward card:", err)
        setError("Could not load scratch card. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    fetchReward()
  }, [orderId])

  // Canvas Scratching & Sparkles rendering
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || scratchRevealed) return

    const parent = canvas.parentElement
    if (!parent) return

    const { width, height } = parent.getBoundingClientRect()
    canvas.width = Math.round(width)
    canvas.height = Math.round(height)

    const ctx = canvas.getContext('2d')

    // Create a realistic silver gradient overlay matching Google Pay
    const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    grad.addColorStop(0, '#e2e8f0') // Light silver highlight
    grad.addColorStop(0.25, '#cbd5e1') // Soft silver-grey
    grad.addColorStop(0.5, '#f1f5f9') // Metallic sheen line
    grad.addColorStop(0.75, '#cbd5e1')
    grad.addColorStop(1, '#94a3b8') // Deep metallic shadow edge
    
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw secondary diagonal sheen lines to look 3D reflective
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'
    ctx.lineWidth = 1.5
    for (let i = -canvas.height; i < canvas.width; i += 24) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i + canvas.height, canvas.height)
      ctx.stroke()
    }

    // Draw secondary metallic noise lines
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)'
    ctx.lineWidth = 1
    for (let i = -canvas.height; i < canvas.width; i += 8) {
      ctx.beginPath()
      ctx.moveTo(i, 0)
      ctx.lineTo(i + canvas.height, canvas.height)
      ctx.stroke()
    }

    // Centered gift reward text/icon placeholder
    ctx.fillStyle = '#475569'
    ctx.font = '900 12px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(t('SCRATCH TO REVEAL'), canvas.width / 2, canvas.height / 2 + 18)
    
    // Draw gift symbol manually on canvas
    ctx.fillStyle = '#8b5cf6'
    ctx.font = '22px sans-serif'
    ctx.fillText('🎁', canvas.width / 2, canvas.height / 2 - 10)

    let activeDrawing = false

    const scratch = (clientX, clientY) => {
      if (scratchRevealed) return
      const rect = canvas.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top

      // Smooth circular reveal brush
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, 24, 0, Math.PI * 2)
      ctx.fill()

      // Spawn sparkle particles at scratch site
      const colors = ['#fbbf24', '#f59e0b', '#38bdf8', '#c084fc', '#ffffff']
      for (let i = 0; i < 4; i++) {
        sparklesRef.current.push({
          x: clientX,
          y: clientY,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8 - 1,
          radius: Math.random() * 2.5 + 1.5,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 1.0,
          decay: 0.02 + Math.random() * 0.03
        })
      }

      // Check transparent pixel ratio (auto-reveal at 30%)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      let transparentPixels = 0

      for (let i = 3; i < data.length; i += 4) {
        if (data[i] === 0) transparentPixels++
      }

      const scratchedPercent = transparentPixels / (data.length / 4)
      if (scratchedPercent > 0.30) {
        setScratchRevealed(true)
        setIsScratching(false)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        triggerConfetti()

        // Notify backend that reward is scratched
        if (dbReward && dbReward.id) {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
          fetch(`${apiUrl}/api/rewards/${dbReward.id}/scratch`, {
            method: 'POST',
          })
            .then(res => res.json())
            .then(updated => {
              if (onRewardApplied) onRewardApplied(updated)
            })
            .catch(err => console.error("Error scratching reward in backend:", err))
        }
      }
    }

    const handleMouseDown = (e) => {
      activeDrawing = true
      setIsScratching(true)
      scratch(e.clientX, e.clientY)
    }

    const handleMouseUp = () => {
      activeDrawing = false
      setIsScratching(false)
    }

    const handleMouseMove = (e) => {
      if (!activeDrawing) return
      scratch(e.clientX, e.clientY)
    }

    const handleTouchStart = (e) => {
      if (e.cancelable) {
        e.preventDefault()
      }
      activeDrawing = true
      setIsScratching(true)
      if (e.touches.length > 0) {
        scratch(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const handleTouchEnd = () => {
      activeDrawing = false
      setIsScratching(false)
    }

    const handleTouchMove = (e) => {
      if (e.cancelable) {
        e.preventDefault()
      }
      if (!activeDrawing || e.touches.length === 0) return
      scratch(e.touches[0].clientX, e.touches[0].clientY)
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mousemove', handleMouseMove)

    canvas.addEventListener('touchstart', handleTouchStart, { passive: false })
    window.addEventListener('touchend', handleTouchEnd)
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('touchstart', handleTouchStart, { passive: false })
      window.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('touchmove', handleTouchMove, { passive: false })
    }
  }, [reward, scratchRevealed, dbReward])

  // Custom particle confetti and scratch sparkles render loop
  const triggerConfetti = () => {
    const canvas = confettiCanvasRef.current
    if (!canvas) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const ctx = canvas.getContext('2d')
    const particles = []
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#ef4444']

    // Spawn 120 colorful confetti explosion shapes
    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2 - 50,
        radius: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 14,
        vy: (Math.random() - 0.5) * 14 - 6,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1
      })
    }

    const frameLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let active = false

      // 1. Render Confetti
      particles.forEach(p => {
        if (p.opacity <= 0) return

        p.x += p.vx
        p.y += p.vy
        p.vy += 0.25 // Gravity
        p.vx *= 0.97 // Air drag
        p.rotation += p.rotationSpeed
        p.opacity -= 0.012

        if (p.opacity > 0) {
          active = true
          ctx.save()
          ctx.translate(p.x, p.y)
          ctx.rotate((p.rotation * Math.PI) / 180)
          ctx.globalAlpha = p.opacity
          ctx.fillStyle = p.color
          ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius)
          ctx.restore()
        }
      })

      // 2. Render Scratch Sparkles
      sparklesRef.current.forEach((s, index) => {
        if (s.alpha <= 0) {
          sparklesRef.current.splice(index, 1)
          return
        }

        s.x += s.vx
        s.y += s.vy
        s.vy += 0.08 // Light gravity
        s.alpha -= s.decay

        if (s.alpha > 0) {
          active = true
          ctx.save()
          ctx.globalAlpha = s.alpha
          ctx.fillStyle = s.color
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      })

      if (active) {
        animationFrameId.current = requestAnimationFrame(frameLoop)
      }
    }

    animationFrameId.current = requestAnimationFrame(frameLoop)
  }

  // Active loop for rendering sparkles *while* scratching before final reveal
  useEffect(() => {
    const canvas = confettiCanvasRef.current
    if (!canvas || scratchRevealed) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    const ctx = canvas.getContext('2d')

    const drawSparklesOnly = () => {
      if (scratchRevealed) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      let active = false

      sparklesRef.current.forEach((s, index) => {
        if (s.alpha <= 0) {
          sparklesRef.current.splice(index, 1)
          return
        }

        s.x += s.vx
        s.y += s.vy
        s.vy += 0.08
        s.alpha -= s.decay

        if (s.alpha > 0) {
          active = true
          ctx.save()
          ctx.globalAlpha = s.alpha
          ctx.fillStyle = s.color
          
          // Draw sparkle star/circle
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2)
          ctx.fill()
          ctx.restore()
        }
      })

      animationFrameId.current = requestAnimationFrame(drawSparklesOnly)
    }

    drawSparklesOnly()

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [scratchRevealed])

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-[32px] p-8 max-w-sm w-full relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl">
          <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin mb-4" />
          <p className="text-sm font-semibold text-slate-600">{t('Loading reward details...')}</p>
        </div>
      </div>
    )
  }

  if (error || !reward) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-[32px] p-6 max-w-sm w-full relative overflow-hidden flex flex-col items-center justify-center text-center shadow-2xl border border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-1.5 rounded-full hover:bg-slate-50"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
            <X size={24} />
          </div>
          <p className="text-sm font-bold text-slate-800 mb-2">{t('Scratch Card Unavailable')}</p>
          <p className="text-xs text-slate-500 mb-5 leading-relaxed">{t(error || 'This order does not have a reward card available.')}</p>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition"
          >
            {t('Close')}
          </button>
        </div>
      </div>
    )
  }

  const RewardIcon = reward.icon

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <canvas
        ref={confettiCanvasRef}
        className="pointer-events-none fixed inset-0 z-[101]"
      />

      <div className="bg-white rounded-[32px] shadow-2xl max-w-sm w-full relative overflow-hidden border border-slate-100 p-6 flex flex-col items-center text-center animate-scale-in z-[102] max-h-[95vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-1.5 rounded-full hover:bg-slate-50"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        {/* Card Template Frame - Scales/Vibrates slightly on touch when active scratching */}
        <div className={`w-full border-2 rounded-2xl p-5 mb-5 mt-2 flex flex-col items-center justify-between relative overflow-hidden transition-all duration-300 ${reward.bgLight} ${reward.borderClass} ${isScratching ? 'scale-[0.98] rotate-[0.5deg] shadow-inner' : 'scale-100 shadow-sm'}`}>
          
          {/* Confetti decoration inside the card */}
          {scratchRevealed && (
            <div className="absolute inset-0 pointer-events-none opacity-20">
              <Sparkles size={48} className={`absolute top-4 left-4 animate-pulse ${reward.textClass}`} />
              <Sparkles size={36} className={`absolute bottom-6 right-6 animate-pulse ${reward.textClass}`} />
            </div>
          )}

          {/* Dotted border layer for scratch surface */}
          {!scratchRevealed && (
            <div className="absolute inset-0 z-30 rounded-2xl overflow-hidden cursor-crosshair">
              <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
            </div>
          )}

          {/* 1. Top Status Tag */}
          <div className={`px-4 py-1.5 rounded-full text-xs font-bold border uppercase tracking-wide mb-5 flex items-center gap-1.5 ${reward.tagClass}`}>
            {t(reward.statusTag)}
          </div>

          {/* 2. Card Title Area */}
          <div className="mb-4">
            <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{t(reward.badgeText)}</span>
          </div>

          {/* 3. Hero Icon Area */}
          <div className="relative mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center bg-white border border-slate-100 shadow-sm ${reward.textClass}`}>
              <RewardIcon size={36} className="animate-bounce-slow" />
            </div>
            {/* Glow backing */}
            <div className={`absolute inset-0 -z-10 rounded-full blur-xl opacity-20 ${reward.bgLight}`}></div>
          </div>

          {/* 4. Main Reward Message */}
          <h2 className="text-2xl font-black tracking-tight text-slate-900 mb-2 font-brand leading-none">
            {t(reward.message)}
          </h2>

          {/* 5. Description Text */}
          <div className="text-xs text-slate-500 font-medium px-4 mb-6 leading-relaxed">
            <p className={reward.referenceLink ? "mb-2" : ""}>{t(reward.description)}</p>
            {reward.referenceLink && (
              <a
                href={reward.referenceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 mt-1 text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline"
              >
                <span>Source: {reward.sourceName || 'Link'}</span>
                <span className="text-[10px]">↗</span>
              </a>
            )}
          </div>

          {/* 6. Footer Mini Card */}
          <div className="w-full bg-white/70 border border-slate-100 rounded-xl p-3 flex items-center justify-center gap-2 text-[11px] font-bold text-slate-600 shadow-sm">
            {reward.category === 'monetary' ? (
              <>
                <Clock size={14} className={reward.textClass} />
                <span>{t(reward.footerText)}</span>
              </>
            ) : (
              <>
                <Sparkles size={14} className={reward.textClass} />
                <span>{t(reward.footerText)}</span>
              </>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          onClick={onClose}
          className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-white shadow-md transition duration-300 transform hover:-translate-y-0.5 ${reward.buttonClass}`}
        >
          {t(reward.buttonText)}
        </button>
      </div>
    </div>
  )
}
