'use client'

import { useEffect, useRef, useState } from 'react'
import { X, Camera, AlertTriangle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

export default function QRScannerModal({ onClose, onScanSuccess }) {
  const { t } = useTranslation()
  const [cameraState, setCameraState] = useState('INITIALIZING') // INITIALIZING, READY, ACTIVE, ERROR
  const [errorMessage, setErrorMessage] = useState('')
  const scannerRef = useRef(null)
  const qrRegionId = 'html5qr-code-full-region'

  useEffect(() => {
    let html5QrCode = null

    const startScanner = async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        
        // Ensure container is still mounted
        if (!document.getElementById(qrRegionId)) return

        html5QrCode = new Html5Qrcode(qrRegionId)
        scannerRef.current = html5QrCode

        setCameraState('READY')

        // Start scanning with front/back camera (prefer environment-facing back camera)
        await html5QrCode.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
          },
          (decodedText) => {
            // Success callback
            handleScanSuccess(decodedText)
          },
          (errorMessage) => {
            // Verbose logging (can ignore standard frame-errors)
          }
        )

        setCameraState('ACTIVE')
      } catch (err) {
        console.error('QR initialization error:', err)
        setCameraState('ERROR')
        setErrorMessage(
          err.message || t('Could not access your camera. Please check permissions.')
        )
      }
    }

    startScanner()

    return () => {
      // Clean up scanner on unmount
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode
          .stop()
          .then(() => {
            html5QrCode.clear()
          })
          .catch((err) => console.error('Failed to stop scanner:', err))
      }
    }
  }, [t])

  const handleScanSuccess = (decodedText) => {
    // Parse scanned text
    // If it's a URL like: https://printsmart.com/customer/language?shopId=5A-12345
    // or just the slug like: 5A-12345
    let resolvedShopId = decodedText.trim()
    try {
      if (decodedText.startsWith('http://') || decodedText.startsWith('https://')) {
        const url = new URL(decodedText)
        const shopIdParam = url.searchParams.get('shopId')
        if (shopIdParam) {
          resolvedShopId = shopIdParam
        }
      }
    } catch (e) {
      console.warn('Scanned text is not a valid URL, using raw text:', e)
    }

    // Trigger success callback
    if (onScanSuccess) {
      onScanSuccess(resolvedShopId)
    }

    // Stop scanner and close
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().then(() => {
        onClose()
      }).catch(() => onClose())
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl max-w-sm w-full border border-slate-100 overflow-hidden text-xs font-semibold text-slate-700">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Camera size={16} className="text-indigo-600" />
            <h3 className="font-extrabold text-slate-800 text-sm">Scan Store QR Code</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Camera Scanner View Area */}
        <div className="p-6 flex flex-col items-center justify-center space-y-4">
          <div className="relative w-full aspect-square max-w-[280px] bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-200 flex items-center justify-center">
            {/* Camera viewport region for html5-qrcode */}
            <div id={qrRegionId} className="w-full h-full object-cover"></div>

            {/* Transition states */}
            {cameraState === 'INITIALIZING' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white space-y-3 p-4 text-center">
                <div className="w-8 h-8 border-4 border-t-indigo-500 border-slate-700 rounded-full animate-spin"></div>
                <p>Requesting camera permissions...</p>
              </div>
            )}

            {cameraState === 'READY' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white space-y-3 p-4 text-center">
                <div className="w-8 h-8 border-4 border-t-indigo-500 border-slate-700 rounded-full animate-spin"></div>
                <p>Starting camera stream...</p>
              </div>
            )}

            {cameraState === 'ERROR' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white space-y-3 p-4 text-center">
                <AlertTriangle size={32} className="text-rose-500 animate-bounce" />
                <p className="text-xs font-bold leading-normal text-rose-200">{errorMessage}</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs hover:bg-slate-700 transition mt-2"
                >
                  Cancel
                </button>
              </div>
            )}

            {cameraState === 'ACTIVE' && (
              <div className="absolute inset-0 pointer-events-none border-2 border-indigo-500/50 rounded-2xl">
                {/* Target box overlays */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-dashed border-indigo-400 rounded-xl animate-pulse"></div>
              </div>
            )}
          </div>

          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Align the store QR code inside the frame
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="w-full py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition text-center"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
