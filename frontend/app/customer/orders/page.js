'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Inbox, Upload, RotateCcw, Download, Trash2, Home, Clock, AlertCircle } from 'lucide-react'
import useTranslation from '../../../src/hooks/useTranslation'
import BackButton from '../../components/BackButton'
import FeedbackButton from '../../components/FeedbackButton'
import FeedbackLink from '../../components/FeedbackLink'

export default function OrdersPage() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = searchParams.get('shopId')
  const customerUserId = searchParams.get('userId')

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Delete Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // Scratch Coupon State
  const [scratchRevealed, setScratchRevealed] = useState(false)
  const canvasRef = useCanvasRef(scratchRevealed, setScratchRevealed)

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    
    // Resolve user ID from session/localStorage or searchParams
    let resolvedUserId = customerUserId
    if (resolvedUserId === 'undefined' || resolvedUserId === 'null') {
      resolvedUserId = null
    }
    
    if (!resolvedUserId) {
      const sessionStr = localStorage.getItem('customerSession')
      if (sessionStr) {
        try {
          resolvedUserId = JSON.parse(sessionStr).userId
        } catch (err) {
          console.error('Error parsing customer session:', err)
        }
      }
    }

    if (!resolvedUserId) {
      setError(t('Please go through the language page to register your user details first.'))
      setLoading(false)
      return
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/orders/user/${resolvedUserId}`)
      if (!response.ok) {
        throw new Error('Failed to retrieve order history')
      }
      const data = await response.json()
      setOrders(data)
    } catch (err) {
      console.error('Fetch orders error:', err)
      setError(t('Failed to fetch your print orders. Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [customerUserId])

  const openDeleteModal = (order) => {
    setOrderToDelete(order)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setOrderToDelete(null)
    setShowDeleteModal(false)
  }

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return
    setDeleting(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/orders/${orderToDelete.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.message || 'Failed to delete order')
      }

      // Re-fetch orders after successful deletion
      await fetchOrders()
      closeDeleteModal()
    } catch (err) {
      console.error('Delete order error:', err)
      alert(err.message || t('Could not cancel the order.'))
    } finally {
      setDeleting(false)
    }
  }

  const handleDownloadInvoice = (orderId) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
    window.open(`${apiUrl}/api/orders/${orderId}/invoice`, '_blank')
  }

  const statusColors = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    ACCEPTED: 'bg-blue-100 text-blue-800 border-blue-200',
    PRINTING: 'bg-purple-100 text-purple-800 border-purple-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  }

  const formatTimestamp = (isoString) => {
    const dateObj = new Date(isoString)
    return dateObj.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }) + ' at ' + dateObj.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="wave-bg min-h-screen flex flex-col items-center justify-start px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
      {/* Step Header */}
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mb-8">
        <div className="step-header">
          <div className="step-number">7</div>
          <div>
            <h1 className="text-3xl font-bold text-black font-brand">{t('My Orders')}</h1>
            <p className="text-gray-600">{t('Track printing queues and download invoices')}</p>
          </div>
        </div>
      </div>

      {/* Card Container */}
      <div className="glassmorphism w-full max-w-md sm:max-w-xl lg:max-w-4xl p-6 sm:p-8 lg:p-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 sm:gap-3">
            <BackButton />
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition"
            >
              <Home size={18} />
              {t('Home')}
            </button>
            <button
              onClick={() => router.push(`/customer/upload?shopId=${shopId || ''}&userId=${customerUserId || ''}`)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2 text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition"
            >
              <Upload size={18} />
              {t('Upload File')}
            </button>
          </div>
          <span className="text-sm font-semibold text-gray-600">{t('Step 7 of 7')}</span>
        </div>

        {/* Scratch Coupon Section */}
        {orders.length > 0 && (
          <div className="mb-8 p-4 bg-white/70 border border-purple-200 rounded-xl">
            <p className="text-center text-gray-700 text-sm font-bold mb-3">
              {t('🎉 Scratch below to reveal your coupon discount!')}
            </p>
            <div
              className="relative w-full h-32 rounded-lg border-2 border-purple-300 border-dashed bg-purple-50 flex items-center justify-center overflow-hidden cursor-crosshair"
            >
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full scratch-canvas"
              />
              {!scratchRevealed && (
                <div className="text-center z-10 pointer-events-none select-none">
                  <RotateCcw size={28} className="mx-auto text-purple-600 mb-2 animate-spin-slow" />
                  <p className="text-purple-700 font-bold text-sm">{t('SCRATCH SURFACE HERE')}</p>
                </div>
              )}
              {scratchRevealed && (
                <div className="text-center z-10 animate-fade-in">
                  <p className="text-2xl font-bold text-purple-700">{t('Flat 15% OFF on Next Print!')}</p>
                  <p className="text-xs text-purple-500 font-semibold mt-1">{t('Code: SMARTPRINT15')}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error/Loading */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 font-semibold animate-pulse text-base">{t('Loading order database history...')}</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-sm text-red-700 font-semibold">{error}</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-6 mb-8">
            {orders.map((order) => (
              <div key={order.id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm space-y-4">
                {/* Header Row */}
                <div className="flex justify-between items-start flex-wrap gap-2 pb-3 border-b border-gray-150">
                  <div>
                    <span className="font-bold text-indigo-700 text-base">{order.orderId}</span>
                    <p className="text-xs text-gray-500 font-semibold mt-0.5">{formatTimestamp(order.createdAt)}</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full border ${statusColors[order.status] || statusColors['PENDING']}`}>
                    {t(order.status)}
                  </span>
                </div>

                {/* File list */}
                <div className="space-y-3">
                  {order.orderFiles && order.orderFiles.map((file, fileIdx) => {
                    let displayName = file.customFileName || file.originalFileName;
                    let fileConfig = file.config || order.printConfiguration;
                    let fileOrderId = file.orderId || order.orderId;

                    // Fallback parsing just in case
                    if (displayName && displayName.includes('|')) {
                      try {
                        const parts = displayName.split('|');
                        displayName = parts[0];
                        const parsed = JSON.parse(parts[1]);
                        if (parsed) {
                          fileConfig = parsed || fileConfig;
                          fileOrderId = parsed.orderId || fileOrderId;
                        }
                      } catch (e) {
                        console.error("Failed to parse config from file name", e);
                      }
                    }

                    const copiesCount = fileConfig?.copies || 1;
                    const sizeLabel = fileConfig?.paperSize || 'A4';
                    const printTypeLabel = fileConfig?.printType === 'COLOR' ? t('Color') : t('B&W');
                    const sidesLabel = fileConfig?.sides === 'DOUBLE' ? t('Double-sided') : t('Single-sided');

                    return (
                      <div key={file.id || fileIdx} className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col gap-1 text-sm shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
                        <div className="flex items-center justify-between">
                          <p className="text-gray-800 font-bold truncate flex-1">
                            {displayName} <span className="text-indigo-600 font-mono text-xs ml-1 font-extrabold">({fileOrderId})</span>
                          </p>
                          <span className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg font-bold flex-shrink-0 ml-3">
                            {copiesCount} {t('copies')}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 font-semibold mt-1">
                          <span>{t('Size')}: {t(sizeLabel)}</span>
                          <span>•</span>
                          <span>{t('Type')}: {printTypeLabel}</span>
                          <span>•</span>
                          <span>{t('Sides')}: {sidesLabel}</span>
                          {fileConfig?.orientation && (
                            <>
                              <span>•</span>
                              <span>{t(fileConfig.orientation)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer details & Action buttons */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900 text-base">₹{order.totalAmount.toFixed(2)}</span>
                    <span className="text-gray-500 text-xs font-semibold flex items-center gap-1">
                      <Clock size={14} className="text-indigo-500" />
                      {t('Queue Position')}: {order.queue ? (order.queue.status === 'DONE' ? t('Done') : `#${order.queue.position}`) : t('Pending')}
                    </span>
                  </div>
                  
                  {/* Action Group */}
                  <div className="flex gap-2">
                    {/* Invoice Download */}
                    {order.invoice && (
                      <button
                        type="button"
                        onClick={() => handleDownloadInvoice(order.id)}
                        className="px-3 py-2 rounded-lg text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition flex items-center gap-1.5"
                      >
                        <Download size={14} />
                        {t('Invoice PDF')}
                      </button>
                    )}
                    
                    {/* Delete Order button (Pending orders only) */}
                    {order.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => openDeleteModal(order)}
                        className="px-3 py-2 rounded-lg text-xs font-bold text-red-700 bg-red-50 border border-red-100 hover:bg-red-100 transition flex items-center gap-1.5"
                      >
                        <Trash2 size={14} />
                        {t('Delete Order')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Inbox size={48} className="mx-auto text-gray-400 mb-4 animate-bounce" />
            <p className="text-gray-600 font-bold">{t('No order details found in the database.')}</p>
            <button
              onClick={() => router.push(`/customer/upload?shopId=${shopId || ''}&userId=${customerUserId || ''}`)}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg text-sm transition"
            >
              {t('Upload and Print Now')}
            </button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && orderToDelete && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4 animate-fade-in border border-gray-150">
              <h3 className="text-lg font-bold text-gray-900">{t('Confirm Order Deletion')}</h3>
              <p className="text-sm text-gray-600 font-medium">
                {t('Are you sure you want to delete order')} <strong className="text-indigo-700">{orderToDelete.orderId}</strong>? {t('This action cannot be undone.')}
              </p>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  disabled={deleting}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold border border-gray-300 hover:bg-gray-50 transition"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleDeleteOrder}
                  disabled={deleting}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition"
                >
                  {deleting ? t('Deleting...') : t('Delete Order')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reusable help links */}
        <FeedbackLink />
      </div>

      <FeedbackButton />
    </div>
  )
}

function useCanvasRef(scratchRevealed, setScratchRevealed) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const draw = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const { width, height } = parent.getBoundingClientRect()
      
      canvas.width = Math.round(width)
      canvas.height = Math.round(height)

      if (canvas.width <= 0 || canvas.height <= 0) return

      const ctx = canvas.getContext('2d')
      
      // Draw scratch layer
      ctx.fillStyle = '#cbd5e1' // slate-300
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Add silver texture lines
      ctx.strokeStyle = '#94a3b8' // slate-400
      ctx.lineWidth = 1
      for (let i = 0; i < canvas.width; i += 8) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i + 15, canvas.height)
        ctx.stroke()
      }
    }

    draw()

    // Handle scratch effect
    let isDrawing = false

    const scratch = (clientX, clientY) => {
      if (scratchRevealed) return
      const rect = canvas.getBoundingClientRect()
      const x = clientX - rect.left
      const y = clientY - rect.top

      const ctx = canvas.getContext('2d')
      ctx.globalCompositeOperation = 'destination-out'
      ctx.beginPath()
      ctx.arc(x, y, 20, 0, Math.PI * 2)
      ctx.fill()

      // Calculate how much has been scratched
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data
      let transparentPixels = 0

      for (let i = 3; i < data.length; i += 4) {
        if (data[i] === 0) transparentPixels++
      }

      const scratchedPercent = transparentPixels / (data.length / 4)
      if (scratchedPercent > 0.45) {
        setScratchRevealed(true)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
      }
    }

    const handleMouseDown = () => { isDrawing = true }
    const handleMouseUp = () => { isDrawing = false }
    const handleMouseMove = (e) => {
      if (!isDrawing) return
      scratch(e.clientX, e.clientY)
    }

    const handleTouchStart = () => { isDrawing = true }
    const handleTouchEnd = () => { isDrawing = false }
    const handleTouchMove = (e) => {
      if (!isDrawing || e.touches.length === 0) return
      scratch(e.touches[0].clientX, e.touches[0].clientY)
    }

    canvas.addEventListener('mousedown', handleMouseDown)
    canvas.addEventListener('mouseup', handleMouseUp)
    canvas.addEventListener('mousemove', handleMouseMove)
    
    canvas.addEventListener('touchstart', handleTouchStart)
    canvas.addEventListener('touchend', handleTouchEnd)
    canvas.addEventListener('touchmove', handleTouchMove)

    const ro = new ResizeObserver(() => draw())
    const parent = canvas.parentElement
    if (parent) ro.observe(parent)

    return () => {
      ro.disconnect()
      canvas.removeEventListener('mousedown', handleMouseDown)
      canvas.removeEventListener('mouseup', handleMouseUp)
      canvas.removeEventListener('mousemove', handleMouseMove)
      canvas.removeEventListener('touchstart', handleTouchStart)
      canvas.removeEventListener('touchend', handleTouchEnd)
      canvas.removeEventListener('touchmove', handleTouchMove)
    }
  }, [scratchRevealed])

  return canvasRef
}