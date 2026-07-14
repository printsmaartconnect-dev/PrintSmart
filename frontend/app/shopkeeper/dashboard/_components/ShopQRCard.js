'use client'

import { useState } from 'react'
import { QrCode, Upload, Printer, Share2, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function ShopQRCard({ shopName, shopkeeperIdCode, qrDetails }) {
  const { t } = useTranslation()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const shopId = qrDetails?.slug || shopkeeperIdCode || 'code'
  const qrVal = qrDetails?.qrValue || `https://print-smart-18.vercel.app/shop/${shopId}`
  const fallbackQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrVal)}`
  
  const targetUrl = qrDetails?.qrCodeUrl
  const qrImageUrl = targetUrl 
    ? (targetUrl.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'}${targetUrl}` : targetUrl)
    : fallbackQrUrl

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrVal)
    alert(t('Shop link copied to clipboard!'))
  }

  return (
    <>
      {/* Injecting CSS Keyframes for Scan Line Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes qr-scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-qr-scan {
          animation: qr-scan 2.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}} />

      <div className="bg-white/90 backdrop-blur-md border border-violet-100 hover:border-violet-300 rounded-3xl p-6 shadow-sm hover:shadow-[0_12px_30px_rgba(139,92,246,0.08)] flex flex-col items-center text-center relative overflow-hidden transition-all duration-500 group">
        {/* Graphic Pastel Glow Spots */}
        <div className="absolute -top-10 -right-10 w-28 h-28 bg-violet-200/40 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-pink-100/40 rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

        {/* Header tag */}
        <span className="text-[10px] font-extrabold text-violet-600 uppercase tracking-widest mb-1.5 relative z-10">
          {t('CUSTOMER PRINT QR CODE')}
        </span>
        
        {/* Heading */}
        <h2 className="text-base font-black text-slate-800 mb-2 relative z-10">
          {t('Scan, Upload, Print')}
        </h2>
        
        {/* Description */}
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[200px] mb-5 relative z-10">
          {t('Let your customers scan the QR code to upload their files instantly.')}
        </p>

        {/* QR Code Container with brackets & scan line */}
        <div 
          onClick={() => setIsModalOpen(true)}
          className="relative p-4 bg-white border border-slate-100 rounded-2xl shadow-sm mb-5 cursor-pointer hover:shadow-md transition-all duration-300 relative overflow-hidden"
        >
          {/* Animated Scanning Line */}
          <div className="absolute left-2 right-2 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent animate-qr-scan pointer-events-none z-10" />

          {/* Decorative purple scanning corner brackets */}
          <span className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-violet-600 rounded-tl-md" />
          <span className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-violet-600 rounded-tr-md" />
          <span className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-violet-600 rounded-bl-md" />
          <span className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-violet-600 rounded-br-md" />
          
          <div className="w-[140px] h-[140px] flex items-center justify-center relative">
            <img 
              src={qrImageUrl} 
              alt="Shop QR Code" 
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* Action steps */}
        <div className="flex items-center justify-between w-full max-w-[240px] mb-6 text-slate-500 font-semibold relative z-10">
          <div className="flex flex-col items-center gap-1.5 flex-1 hover:translate-y-[-2px] transition-transform duration-300">
            <div className="p-2 bg-slate-50 border border-slate-100/50 rounded-xl text-slate-600 shadow-sm">
              <QrCode size={16} />
            </div>
            <span className="text-[10px] font-bold text-slate-500">{t('1. Scan')}</span>
          </div>
          
          <span className="text-slate-300 text-sm font-bold pb-4">+</span>
          
          <div className="flex flex-col items-center gap-1.5 flex-1 hover:translate-y-[-2px] transition-transform duration-300">
            <div className="p-2 bg-slate-50 border border-slate-100/50 rounded-xl text-slate-600 shadow-sm">
              <Upload size={16} />
            </div>
            <span className="text-[10px] font-bold text-slate-500">{t('2. Upload')}</span>
          </div>
          
          <span className="text-slate-300 text-sm font-bold pb-4">+</span>
          
          <div className="flex flex-col items-center gap-1.5 flex-1 hover:translate-y-[-2px] transition-transform duration-300">
            <div className="p-2 bg-slate-50 border border-slate-100/50 rounded-xl text-slate-600 shadow-sm">
              <Printer size={16} />
            </div>
            <span className="text-[10px] font-bold text-slate-500">{t('3. Print')}</span>
          </div>
        </div>

        {/* Copy/Share button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="w-full py-2.5 bg-gradient-to-tr from-violet-50 to-indigo-50 hover:from-violet-100 hover:to-indigo-100 border border-violet-100 text-violet-700 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.01] active:scale-95 relative z-10"
        >
          <Share2 size={14} />
          {t('Share QR Code')}
        </button>
      </div>

      {/* Maximized Popup Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 shadow-2xl relative max-w-[90vw] max-h-[90vh] flex flex-col items-center animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 bg-slate-50 hover:bg-slate-100 rounded-full transition"
              onClick={() => setIsModalOpen(false)}
            >
              <X size={18} />
            </button>
            
            <h3 className="text-lg font-black text-slate-800 mb-1">
              {shopName || t('Shop QR Code')}
            </h3>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-5">
              {t('Shop ID:')} {shopId}
            </p>
            
            {/* Enlarged QR Container */}
            <div className="w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-center relative overflow-hidden">
              <div className="absolute left-3 right-3 h-[2px] bg-gradient-to-r from-transparent via-violet-500 to-transparent animate-qr-scan pointer-events-none z-10" />
              <span className="absolute top-3 left-3 w-6 h-6 border-t-3 border-l-3 border-violet-600 rounded-tl-md" />
              <span className="absolute top-3 right-3 w-6 h-6 border-t-3 border-r-3 border-violet-600 rounded-tr-md" />
              <span className="absolute bottom-3 left-3 w-6 h-6 border-b-3 border-l-3 border-violet-600 rounded-bl-md" />
              <span className="absolute bottom-3 right-3 w-6 h-6 border-b-3 border-r-3 border-violet-600 rounded-br-md" />
              <img 
                src={qrImageUrl} 
                alt="Shop QR Code Large" 
                className="w-full h-full object-contain relative z-0"
              />
            </div>
            
            {/* Copy button in modal */}
            <button 
              onClick={handleCopyLink}
              className="mt-6 px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-2"
            >
              <Share2 size={14} />
              {t('Copy Shop Link')}
            </button>
          </div>
        </div>
      )}
    </>
  )
}
