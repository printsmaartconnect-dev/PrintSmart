'use client'

import { useState, useRef, useEffect } from 'react'
import { Copy, Gift, X, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import useTranslation from '../../../src/hooks/useTranslation'

export default function CouponPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const canvasRef = useRef(null)
  const [scratchRevealed, setScratchRevealed] = useState(false)
  const [copied, setCopied] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      canvas.width = Math.round(rect.width)
      canvas.height = Math.round(rect.height)

      const ctx = canvas.getContext('2d')

      // Draw scratchy background
      ctx.fillStyle = '#d4d4d8'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add texture
      ctx.fillStyle = '#a1a1aa'
      for (let i = 0; i < 50; i++) {
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          Math.random() * 8 + 2,
          Math.random() * 8 + 2
        )
      }

      // Add stars
      ctx.fillStyle = '#c4c4cc'
      for (let i = 0; i < 30; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const size = Math.random() * 3 + 1
        ctx.fillRect(x, y, size, size)
      }

      // Instruction text (drawn on the scratch layer so it gets erased)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(79, 70, 229, 0.9)'
      ctx.font = '700 20px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
      ctx.fillText(t('SCRATCH SURFACE HERE'), canvas.width / 2, canvas.height / 2 + 10)
      ctx.font = '700 44px system-ui, -apple-system, Segoe UI, Roboto, sans-serif'
      ctx.fillText('🎁', canvas.width / 2, canvas.height / 2 - 24)
    }

    draw()

    const ro = new ResizeObserver(() => draw())
    ro.observe(canvas)

    return () => ro.disconnect()
  }, [t])

  const handleMouseDown = () => {
    setIsDrawing(true)
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const handleMouseMove = (e) => {
    if (!isDrawing || scratchRevealed) return

    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    if (!canvas.width || !canvas.height || !rect.width || !rect.height) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const ctx = canvas.getContext('2d')
    ctx.save()
    ctx.globalCompositeOperation = 'destination-out'
    ctx.beginPath()
    ctx.arc(x * scaleX, y * scaleY, 22 * Math.max(scaleX, scaleY), 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // Check if enough is revealed
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    let transparent = 0

    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 128) transparent++
    }

    if (transparent > (data.length / 4) * 0.6) {
      setScratchRevealed(true)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText('SAVE20')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="wave-bg min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
      {/* Step Header */}
      <div className="glassmorphism w-full max-w-md sm:max-w-xl lg:max-w-3xl p-6 sm:p-8 lg:p-10">
        {/* Window Header */}
        <div className="flex items-center justify-between">
          <div className="mac-dots">
            <div className="mac-dot red"></div>
            <div className="mac-dot yellow"></div>
            <div className="mac-dot green"></div>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-lg hover:bg-black/5 transition"
            aria-label="Close"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        <div className="mt-5 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">{t('Scratch Coupon')}</h1>
          <p className="mt-2 text-gray-600">{t('Scratch the area below to reveal your reward')}</p>
        </div>

        {/* Scratch Area (reward underlay + scratch canvas overlay) */}
        <div className="mt-6 relative overflow-hidden rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/60">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-6">
              <p className="text-indigo-600 font-bold text-sm mb-2">{t('Congratulations!')}</p>
              <p className="text-black font-black text-3xl sm:text-4xl mb-2">{t('YOU WON')}</p>
              <p className="text-indigo-600 font-black text-2xl sm:text-3xl mb-2">{t('Scratch & earn discounts')}</p>
              <p className="text-gray-700 text-sm font-medium">{t('ON YOUR NEXT ORDER')}</p>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            width={360}
            height={220}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onMouseMove={handleMouseMove}
            className="relative z-10 w-full h-52 sm:h-60 lg:h-64 block scratch-canvas"
            style={{ touchAction: 'none' }}
          />
        </div>

        {/* How to Use Section */}
        {scratchRevealed && (
          <div className="mt-6 bg-indigo-50/70 p-4 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                <Gift size={18} className="text-indigo-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{t('How to use:')}</p>
                <p className="text-gray-700 text-sm">{t('Copy the code and apply it at checkout to avail your discount.')}</p>
              </div>
            </div>
          </div>
        )}

        {/* Coupon Code */}
        {scratchRevealed && (
          <div className="mt-5 flex items-center gap-3 border-2 border-dashed border-indigo-300 rounded-xl px-4 py-3">
            <span className="text-indigo-600 font-black text-lg sm:text-xl flex-1">SAVE20</span>
            <button
              type="button"
              onClick={handleCopy}
              className={`px-5 py-2 rounded-full font-semibold transition border ${
                copied
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'
              }`}
            >
              {copied ? t('Copied') : t('Copy')}
            </button>
          </div>
        )}

        {/* Validity */}
        {scratchRevealed && (
          <div className="mt-3 flex items-center justify-center gap-2 text-gray-500 text-xs">
            <Clock size={14} />
            <span>{t('Valid till 31 May 2025')}</span>
          </div>
        )}

        {/* Buttons */}
        {scratchRevealed && (
          <button className="mt-6 w-full gradient-button py-4 px-4 rounded-2xl font-semibold transition text-white">
            {t('Continue Shopping')}
          </button>
        )}
      </div>
    </div>
  )
}