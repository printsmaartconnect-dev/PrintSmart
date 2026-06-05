'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Inbox, Upload, RotateCcw, Download, Trash2, Home, Clock, AlertCircle, FileText, Gift } from 'lucide-react'
import useTranslation from '../../../src/hooks/useTranslation'
import BackButton from '../../components/BackButton'
import FeedbackButton from '../../components/FeedbackButton'
import FeedbackLink from '../../components/FeedbackLink'
import RewardCardModal from '../../components/customer/RewardCardModal'

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
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

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

  const handlePayOffline = async (orderId) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
      const response = await fetch(`${apiUrl}/api/orders/${orderId}/customer-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'ACCEPTED' }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to update order status')
      }

      await fetchOrders()
    } catch (err) {
      console.error('Pay offline error:', err)
      alert(err.message || t('Could not transition to the next step.'))
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

  const completedOrders = orders.filter(o => o.status === 'COMPLETED')
  const latestCompletedOrder = completedOrders.find(o => !o.rewardLog?.scratched) || completedOrders[0]

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

        {/* Premium Scratch & Win Section */}
        {latestCompletedOrder && (
          <div className="mb-8 p-5 bg-white border border-violet-100 rounded-2xl shadow-[0_4px_20px_rgba(139,92,246,0.05)]">
            <h3 className="font-bold text-slate-800 text-sm mb-1 flex items-center gap-1.5">
              <Gift size={16} className="text-violet-600" />
              {t('Scratch & Win')}
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-4">
              {latestCompletedOrder.rewardLog?.scratched 
                ? t('You have scratched the card for order ') + latestCompletedOrder.orderId
                : t('You have an unscratched reward card from your completed print order!')}
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedOrderId(latestCompletedOrder.id)
                setShowRewardModal(true)
              }}
              className="w-full h-32 rounded-xl border-2 border-violet-300 border-dashed bg-violet-50/50 hover:bg-violet-50 hover:border-violet-400 transition flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-violet-100 shadow-sm transition group-hover:scale-110">
                <Gift size={20} className="text-violet-600 animate-pulse" />
              </div>
              <span className="text-xs font-bold text-violet-700 tracking-wide uppercase">
                {latestCompletedOrder.rewardLog?.scratched ? t('View Reward') : t('Tap to scratch')}
              </span>
            </button>
          </div>
        )}

        {/* Payment Box Section */}
        {orders.length > 0 && orders.some(o => o.status === 'PENDING') && (
          (() => {
            const latestPendingOrder = orders.find(o => o.status === 'PENDING')
            const upiId = latestPendingOrder?.shopkeeper?.upiId
            const paymentQrUrl = latestPendingOrder?.shopkeeper?.paymentQrUrl
            const upiLink = upiId ? `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(latestPendingOrder.shopkeeper?.shopName || 'Shopkeeper')}&am=${latestPendingOrder.totalAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent('PrintSmart Order ' + latestPendingOrder.orderId)}` : '#'

            return (
              <div className="mb-8 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl space-y-4 shadow-sm animate-fade-in flex flex-col">
                <div className="space-y-1 text-center">
                  <h3 className="font-bold text-slate-800 text-sm">{t('Payment Options for Order')} <span className="text-indigo-600 font-mono">({latestPendingOrder.orderId})</span></h3>
                  <p className="text-xs text-gray-500 font-semibold">
                    {t('If you are paying online then click on this upi link or paying offline then ignore')}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  {/* Pay Online column with optional QR Code directly above button */}
                  <div className="flex-1 flex flex-col items-center gap-3 w-full">
                    {paymentQrUrl && (
                      <div className="flex flex-col items-center justify-center p-2 bg-white rounded-xl border border-indigo-100 max-w-[150px] shadow-sm">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{t('Scan to Pay')}</p>
                        <div className="w-28 h-28 relative flex items-center justify-center bg-slate-50 border border-slate-100 rounded-lg overflow-hidden">
                          <img
                            src={paymentQrUrl.startsWith('http') ? paymentQrUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${paymentQrUrl}`}
                            alt="Shop Payment QR"
                            className="max-w-full max-h-full object-contain cursor-pointer transition hover:scale-105"
                            onClick={() => window.open(paymentQrUrl.startsWith('http') ? paymentQrUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}${paymentQrUrl}`, '_blank')}
                          />
                        </div>
                      </div>
                    )}
                    {upiId ? (
                      <a
                        href={upiLink}
                        className="w-full inline-flex items-center justify-center gap-2 text-center py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm"
                      >
                        💳 {t('Pay Online (UPI)')}
                      </a>
                    ) : (
                      <button
                        disabled
                        className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed"
                      >
                        💳 {t('Online Payment Unavailable')}
                      </button>
                    )}
                  </div>
                  
                  {/* Pay Offline column */}
                  <div className="flex-1 w-full">
                    <button
                      type="button"
                      onClick={() => handlePayOffline(latestPendingOrder.id)}
                      className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-indigo-700 bg-white border border-indigo-200 hover:bg-indigo-50 transition shadow-sm h-[48px] flex items-center justify-center"
                    >
                      🏪 {t('Pay Offline to Shopkeeper')}
                    </button>
                  </div>
                </div>
              </div>
            )
          })()
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
                  
                  <div className="flex gap-2">
                    {/* Scratch Card / Claim Reward (Completed orders only) */}
                    {order.status === 'COMPLETED' && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedOrderId(order.id)
                          setShowRewardModal(true)
                        }}
                        className={`px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                          order.rewardLog?.scratched 
                            ? 'text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100'
                            : 'text-violet-700 bg-violet-50 border border-violet-150 hover:bg-violet-100 animate-pulse-slow'
                        }`}
                      >
                        <Gift size={14} className={order.rewardLog?.scratched ? 'text-slate-500' : 'text-violet-600 animate-bounce-slow'} />
                        {order.rewardLog?.scratched ? t('View Reward') : t('Scratch Card')}
                      </button>
                    )}
                    {/* View Invoice */}
                    {order.invoice && (
                      <button
                        type="button"
                        onClick={() => router.push(`/customer/invoice/${order.id}`)}
                        className="px-3 py-2 rounded-lg text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition flex items-center gap-1.5"
                      >
                        <FileText size={14} />
                        {t('View Invoice')}
                      </button>
                    )}
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
      
      {showRewardModal && (
        <RewardCardModal 
          orderId={selectedOrderId} 
          onClose={() => {
            setShowRewardModal(false)
            setSelectedOrderId(null)
          }}
          onRewardApplied={() => {
            fetchOrders()
          }}
        />
      )}
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