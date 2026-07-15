'use client'

import React, { useState, useEffect } from 'react'

export default function CustomerGuideTour({ activeStep, targetSelector, text, onNext, onClose }) {
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 })

  useEffect(() => {
    if (!targetSelector) return

    let checkInterval = setInterval(() => {
      const element = document.querySelector(targetSelector)
      if (element) {
        clearInterval(checkInterval)
        const rect = element.getBoundingClientRect()
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        })
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)

    const updatePosition = () => {
      const element = document.querySelector(targetSelector)
      if (element) {
        const rect = element.getBoundingClientRect()
        setCoords({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height
        })
      }
    }

    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)

    return () => {
      clearInterval(checkInterval)
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [targetSelector])

  if (!targetSelector) return null

  return (
    <>
      {/* Target spotlight border highlight */}
      {coords.width > 0 && (
        <div 
          className="absolute border-[2.5px] border-violet-500 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.6)] z-[9995] transition-all duration-300 pointer-events-none"
          style={{
            top: coords.top - 6,
            left: coords.left - 6,
            width: coords.width + 12,
            height: coords.height + 12
          }}
        />
      )}

      {/* Onboarding Dialog Overlay */}
      <div className="fixed bottom-0 right-0 z-[9999] p-4 flex flex-col md:flex-row items-end gap-3 max-w-full pointer-events-auto">
        {/* Tooltip speech bubble dialog */}
        <div className="bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 max-w-sm w-full relative animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="absolute right-[-8px] bottom-10 w-4 h-4 bg-white rotate-45 border-r border-t border-slate-100 hidden md:block" />
          
          <div className="space-y-3 text-left">
            <div className="flex justify-between items-center">
              <span className="text-[10px] uppercase font-bold tracking-widest text-violet-650 bg-violet-50 px-2.5 py-0.5 rounded">
                Guide Step {activeStep}
              </span>
              <button 
                onClick={onClose}
                className="text-[11px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider"
              >
                Skip Guide
              </button>
            </div>
            
            <p className="text-xs sm:text-sm font-semibold text-slate-700 leading-relaxed font-sans">
              {text}
            </p>
            
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onNext}
                className="flex-1 gradient-button py-2 text-xs text-white font-extrabold shadow-md active:scale-95 transition"
              >
                {activeStep === 8 ? 'Finish Tour' : 'Next Step →'}
              </button>
            </div>
          </div>
        </div>

        {/* Character Illustration Container */}
        <div className="w-[120px] sm:w-[150px] shrink-0 transform translate-y-3 animate-in slide-in-from-right-20 duration-300 select-none pointer-events-none">
          <img 
            src="/guide-char.png" 
            alt="Guide character illustration" 
            className="w-full h-auto object-contain"
          />
        </div>
      </div>
    </>
  )
}
