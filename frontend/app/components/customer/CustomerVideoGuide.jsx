'use client'

import React from 'react'

export default function CustomerVideoGuide({ onClose }) {
  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .animate-scaleUp {
          animation: scaleUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}} />
      
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center p-4 select-none animate-fadeIn">
        {/* Centered Modal Container */}
        <div className="flex flex-col items-center max-w-[340px] xs:max-w-sm w-full gap-4 animate-scaleUp">
          {/* Video Card Container */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl w-full aspect-[9/16] relative flex items-center justify-center">
            <video
              src="/cus-guide.mp4"
              autoPlay
              muted
              loop
              playsInline
              controls
              className="w-full h-full object-cover"
            />
          </div>

          {/* Skip Button */}
          <button
            onClick={onClose}
            className="w-full bg-[#1011A5] hover:bg-[#0e0d93] text-white font-extrabold text-2xl py-3 px-6 rounded-2xl shadow-xl transition-all duration-200 active:scale-95 cursor-pointer text-center tracking-wide"
          >
            skip
          </button>
        </div>
      </div>
    </>
  )
}
