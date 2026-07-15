'use client'

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Inbox, Upload, RotateCcw, Download, Trash2, Home, Clock, AlertCircle, FileText, Gift } from 'lucide-react'
import useTranslation from '../../../src/hooks/useTranslation'
import BackButton from '../../components/BackButton'
import FeedbackButton from '../../components/FeedbackButton'
import FeedbackLink from '../../components/FeedbackLink'
import RewardCardModal from '../../components/customer/RewardCardModal'
import CustomerHeader from '../../components/customer/CustomerHeader'
import { validateUpiParams, generateUpiUrl } from '../../../lib/upi'
import CustomerGuideTour from '../../components/customer/CustomerGuideTour'
import { formatCurrency } from '../../../lib/currency'
import { useSocket } from '../../../hooks/useSocket'
import { useSocketContext } from '../../../contexts/SocketProvider'

function OrdersPageContent() {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const shopId = searchParams.get('shopId')
  const customerUserId = searchParams.get('userId')

  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [transactionRef, setTransactionRef] = useState('')

  const { joinRoom, leaveRoom } = useSocketContext();

  useEffect(() => {
    let resolvedUserId = customerUserId;
    if (resolvedUserId === 'undefined' || resolvedUserId === 'null') {
      resolvedUserId = null;
    }
    if (!resolvedUserId) {
      const sessionStr = localStorage.getItem('customerSession');
      if (sessionStr) {
        try {
          resolvedUserId = JSON.parse(sessionStr).userId;
        } catch (err) {
          console.error('Error parsing customer session:', err);
        }
      }
    }

    if (resolvedUserId) {
      joinRoom(`customer:${resolvedUserId}`);
      return () => {
        leaveRoom(`customer:${resolvedUserId}`);
      };
    }
  }, [joinRoom, leaveRoom, customerUserId]);

  useSocket("new-order", (newOrder) => {
    console.log("[Socket] Customer received new order:", newOrder);
    setOrders((prev) => {
      if (prev.some((o) => o.id === newOrder.id)) return prev;
      return [newOrder, ...prev];
    });
  });

  useSocket("order-updated", (updatedOrder) => {
    console.log("[Socket] Customer received order update:", updatedOrder);
    setOrders((prev) =>
      prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o))
    );
  });

  useSocket("storage_cleaned", (data) => {
    console.log("[Socket] Customer received storage cleanup:", data);
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === data.orderId) {
          return {
            ...o,
            filesDeleted: true,
            storageStatus: "CLEANED",
          };
        }
        return o;
      })
    );
  });
  
  // Delete Confirmation Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [submittingRef, setSubmittingRef] = useState(false)
  const [guideStep, setGuideStep] = useState(null)

  useEffect(() => {
    const savedStep = localStorage.getItem('customerGuideStep')
    const skipped = sessionStorage.getItem('customerGuideSkipped')
    if (savedStep === '6' && orders.length > 0 && !skipped) {
      const activeReward = orders.find(o => o.rewardLog && !o.rewardLog.scratched) || orders.find(o => o.rewardLog)
      if (!activeReward) {
        const pendingPayment = orders.some(o => o.status === 'PENDING')
        if (pendingPayment) {
          setGuideStep(7)
        } else {
          setGuideStep(8)
        }
      } else {
        setGuideStep(6)
      }
      localStorage.removeItem('customerGuideStep')
    }
  }, [orders])

  const handleGuideNext = () => {
    if (guideStep === 6) {
      const pendingPayment = orders.some(o => o.status === 'PENDING')
      if (pendingPayment) {
        setGuideStep(7)
      } else {
        setGuideStep(8)
      }
      return
    }
    if (guideStep === 7) {
      setGuideStep(8)
      return
    }
    if (guideStep === 8) {
      setGuideStep(null)
      sessionStorage.setItem('customerGuideSkipped', 'true')
    }
  }

  const guideTexts = {
    6: t('Awesome! Scratch this lucky card to win instant rewards and discounts on your prints!'),
    7: t('After making the payment cash or UPI, click here to confirm to the shopkeeper!'),
    8: t('View details of your active print jobs, request an invoice, or cancel your order here.')
  }

  const guideSelectors = {
    6: '#scratch-card-group',
    7: '#payment-confirm-group',
    8: '#bill-actions-group'
  }
  const [deletingIds, setDeletingIds] = useState([])
  const [showCleanedModal, setShowCleanedModal] = useState(false)

  // Scratch Coupon State
  const [showRewardModal, setShowRewardModal] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState(null)

  // UPI Payment State
  const [platform, setPlatform] = useState('desktop')
  const [paymentInitiated, setPaymentInitiated] = useState(false)
  const [desktopError, setDesktopError] = useState(false)

  const latestPendingOrder = orders.find(o => o.status === 'PENDING')
  const upiId = latestPendingOrder?.shopkeeper?.upiId
  const shopName = latestPendingOrder?.shopkeeper?.shopName
  const amount = latestPendingOrder?.totalAmount

  let upiUrl = ''
  let validationError = null

  if (latestPendingOrder) {
    try {
      upiUrl = generateUpiUrl(upiId, shopName, amount)
    } catch (err) {
      validationError = err.message
    }
  }

  useEffect(() => {
    const detectPlatform = () => {
      const ua = typeof window !== 'undefined' ? window.navigator.userAgent.toLowerCase() : ''
      if (/android/.test(ua)) {
        setPlatform('android')
      } else if (/iphone|ipad|ipod/.test(ua)) {
        setPlatform('ios')
      } else {
        setPlatform('desktop')
      }
    }
    detectPlatform()
  }, [])

  const handleRequestBill = async (orderId) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
      const response = await fetch(`${apiUrl}/api/orders/${orderId}/request-bill`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      })
      if (response.ok) {
        await fetchOrders()
      } else {
        alert(t('Failed to request bill/invoice.'))
      }
    } catch (err) {
      console.error('Request bill error:', err)
      alert(t('Error requesting bill/invoice.'))
    }
  }

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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
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

  // Polling for pending order payments
  useEffect(() => {
    let intervalId
    const hasPendingPayment = orders.some(o => o.status === 'PENDING')
    
    if (hasPendingPayment) {
      intervalId = setInterval(async () => {
        let resolvedUserId = customerUserId
        if (!resolvedUserId || resolvedUserId === 'undefined' || resolvedUserId === 'null') {
          const sessionStr = localStorage.getItem('customerSession')
          if (sessionStr) {
            try {
              resolvedUserId = JSON.parse(sessionStr).userId
            } catch (err) {}
          }
        }
        if (resolvedUserId) {
          try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
            const response = await fetch(`${apiUrl}/api/orders/user/${resolvedUserId}`)
            if (response.ok) {
              const data = await response.json()
              setOrders(data)
            }
          } catch (err) {
            console.error('Polling error:', err)
          }
        }
      }, 5000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [orders, customerUserId])

  const openDeleteModal = (order) => {
    setOrderToDelete(order)
    setShowDeleteModal(true)
  }

  const closeDeleteModal = () => {
    setOrderToDelete(null)
    setShowDeleteModal(false)
  }

  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;
    const targetOrderId = orderToDelete.id;
    const previousOrders = [...orders];

    // 1. Add to deleting list immediately (triggers transition animation)
    setDeletingIds(prev => [...prev, targetOrderId]);
    closeDeleteModal();

    // 2. Wait for 200ms animation (fade-out/collapse) to finish
    await new Promise(resolve => setTimeout(resolve, 200));

    // 3. Update React state immediately without reloading/refetching
    setOrders(prev => prev.filter(order => order.id !== targetOrderId));

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
      const response = await fetch(`${apiUrl}/api/orders/${targetOrderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to delete order');
      }

      // Cleanup target from deletingIds list
      setDeletingIds(prev => prev.filter(id => id !== targetOrderId));
    } catch (err) {
      console.error('Delete order error:', err);
      // 4. Restore previous state if request fails
      setOrders(previousOrders);
      setDeletingIds(prev => prev.filter(id => id !== targetOrderId));
      alert(err.message || t('Could not cancel the order. Please try again.'));
    }
  }

  const handleVerifyPayment = async (orderId, ref, gateway = 'UPI') => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
      const response = await fetch(`${apiUrl}/api/payments/verify/${orderId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionRef: ref,
          paymentGateway: gateway,
          amount: orders.find(o => o.id === orderId)?.totalAmount || 0
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.message || 'Failed to register payment verification code')
      }

      await fetchOrders()
    } catch (err) {
      console.error('Verify payment error:', err)
      alert(err.message || t('Could not register payment verification details.'))
    }
  }

  const handlePayCash = async (orderId) => {
    if (confirm(t('Confirm cash payment at the counter?'))) {
      await handleVerifyPayment(orderId, 'CASH_AT_COUNTER', 'CASH')
    }
  }

  const handleDownloadInvoice = (orderId) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com'
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

  const activeRewardOrder = orders.find(o => o.rewardLog && !o.rewardLog.scratched) || orders.find(o => o.rewardLog)

  return (
    <div className="wave-bg min-h-screen flex flex-col">
      <CustomerHeader stepText={t('Step 3 of 3')} />

      <main className="w-full max-w-md sm:max-w-xl lg:max-w-4xl px-4 py-8 mx-auto flex-grow flex flex-col justify-start">
        {/* Step Header */}
        <div className="w-full mb-8 animate-fade-in">
          <div className="step-header mb-0">
            <div className="step-number">3</div>
            <div>
              <h1 className="text-3xl font-bold text-black font-brand">{t('My Orders')}</h1>
              <p className="text-gray-600">{t('Track printing queues and download invoices')}</p>
            </div>
          </div>
        </div>

        {/* Card Container */}
        <div className="glassmorphism w-full p-6 sm:p-8 lg:p-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <BackButton />
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2 text-xs font-bold text-indigo-655 hover:bg-indigo-50 transition"
              >
                <Home size={18} />
                {t('Home')}
              </button>
              <button
                onClick={() => router.push(`/customer/language?shopId=${shopId || ''}&userId=${customerUserId || ''}`)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-white px-3 py-2 text-xs font-bold text-indigo-655 hover:bg-indigo-50 transition"
              >
                <Upload size={18} />
                {t('Upload File')}
              </button>
            </div>
          </div>

        {/* Google Pay-style Premium Scratch & Win Section */}
        {activeRewardOrder && (
          <div id="scratch-card-group" className="mb-8">
            <button
              type="button"
              onClick={() => {
                setSelectedOrderId(activeRewardOrder.id)
                setShowRewardModal(true)
              }}
              className="relative w-full h-36 rounded-2xl overflow-hidden border border-violet-200/50 bg-gradient-to-r from-violet-600 via-indigo-650 to-purple-600 text-white shadow-lg transition-all duration-300 hover:shadow-violet-500/20 hover:scale-[1.02] active:scale-98 flex items-center justify-between px-6 group cursor-pointer"
            >
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.4),transparent_50%)] animate-pulse" />
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl group-hover:bg-yellow-300/30 transition-all duration-300" />
              
              <div className="flex items-center gap-4 relative z-10 text-left">
                <div className="relative w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner group-hover:rotate-6 transition-transform duration-305">
                  <Gift size={32} className="text-yellow-300 animate-bounce" />
                  <span className="absolute -top-1 -right-1 text-xs animate-ping">✨</span>
                  <span className="absolute -bottom-1 -left-1 text-[10px] animate-pulse">⭐</span>
                </div>
                
                <div>
                  <h4 className="font-extrabold text-base tracking-wide text-yellow-300 flex items-center gap-1.5 uppercase drop-shadow-sm font-brand">
                    {activeRewardOrder.rewardLog?.scratched ? t('Reward Unlocked!') : t('Lucky Reward Awaits!')}
                  </h4>
                  <p className="text-xs text-violet-100 font-medium mt-1 max-w-[200px]">
                    {activeRewardOrder.rewardLog?.scratched 
                      ? t('View your applied offer') 
                      : t('Tap to scratch and claim your cashback coupon!')}
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex flex-col items-center gap-1 flex-shrink-0">
                <span className="px-4 py-2 bg-yellow-300 hover:bg-yellow-400 text-violet-955 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all duration-200 group-hover:scale-105 active:scale-95">
                  {activeRewardOrder.rewardLog?.scratched ? t('View') : t('Scratch Now')}
                </span>
                <span className="text-[9px] text-yellow-200/80 font-bold tracking-widest uppercase animate-pulse mt-1">
                  {activeRewardOrder.rewardLog?.scratched ? t('Scratched') : t('Tap Here')}
                </span>
              </div>
            </button>
          </div>
        )}

        {/* Payment Box Section */}
        {orders.length > 0 && orders.some(o => o.status === 'PENDING') && (
            (() => {
            return (
              <div id="payment-confirm-group" className="mb-8 p-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 border border-indigo-150 rounded-2xl space-y-4 shadow-sm animate-fade-in flex flex-col items-center text-center">
                <div className="space-y-1">
                  <h3 className="font-bold text-slate-800 text-base">{t('Complete Your Payment')}</h3>
                  <p className="text-xs text-gray-500 font-semibold max-w-md">
                    {t('Pay online via QR code at the shop, or pay cash to the shopkeeper. Once done, click the button below to confirm.')}
                  </p>
                </div>

                <div className="w-full max-w-sm">
                  <button
                    type="button"
                    disabled={submittingRef}
                    onClick={async () => {
                      setSubmittingRef(true)
                      const generatedRef = `AUTO-${latestPendingOrder.id.substring(0, 8)}-${Date.now()}`
                      await handleVerifyPayment(latestPendingOrder.id, generatedRef, 'CASH')
                      setSubmittingRef(false)
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition duration-200 shadow-md animate-pulse"
                  >
                    {submittingRef ? t('Registering...') : `✅ ${t('I Have Paid (Payment Done)')}`}
                  </button>
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
            {orders.map((order) => {
              const isDeleting = deletingIds.includes(order.id);
              return (
                <div 
                  key={order.id} 
                  className={`bg-white border border-gray-200 shadow-sm text-left transition-all duration-200 ease-out ${
                    isDeleting 
                      ? 'opacity-0 max-h-0 scale-95 border-0 p-0 m-0 overflow-hidden' 
                      : 'opacity-100 max-h-[2000px] p-5 space-y-4'
                  }`}
                  style={{
                    marginTop: isDeleting ? '0px' : undefined,
                    marginBottom: isDeleting ? '0px' : undefined,
                    borderWidth: isDeleting ? '0px' : undefined,
                  }}
                >
                {/* Header Row */}
                <div className="flex justify-between items-start flex-wrap gap-2 pb-3 border-b border-gray-150">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-indigo-700 text-base">{order.orderId}</span>
                      {order.filesDeleted && (
                        <span 
                          onClick={(e) => { e.stopPropagation(); setShowCleanedModal(true); }}
                          className="inline-flex items-center rounded-full bg-slate-100 border border-slate-200/60 px-2 py-0.5 text-[10px] font-bold text-slate-500 relative group cursor-pointer shrink-0 hover:bg-slate-200 hover:text-slate-700 transition"
                          title="The uploaded files have been automatically removed after 6 hours to save storage. Click for info."
                        >
                          {t("Storage Cleaned")}
                          {/* Tooltip */}
                          <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded bg-slate-800 p-2 text-center text-[10px] font-medium text-white opacity-0 transition group-hover:opacity-100 z-10 shadow-lg">
                            {t("The uploaded files have been automatically removed after 6 hours to save storage. Click for details.")}
                          </span>
                        </span>
                      )}
                      {order.paymentLog && (
                        <>
                          {order.paymentLog.paymentStatus === 'PENDING' && (
                            <span className="inline-flex items-center rounded bg-amber-50 text-amber-700 border border-amber-200/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                              ⏳ {order.paymentLog.paymentGateway === 'UPI' ? t('Payment Pending Verification') : t('Cash Pending Verification')}
                            </span>
                          )}
                          {order.paymentLog.paymentStatus === 'VERIFIED' && (
                            <span className="inline-flex items-center rounded bg-emerald-50 text-emerald-700 border border-emerald-200/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                              ✅ {t('Paid')}
                            </span>
                          )}
                          {order.paymentLog.paymentStatus === 'FAILED' && (
                            <span className="inline-flex items-center rounded bg-rose-50 text-rose-700 border border-rose-200/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                              ❌ {t('Payment Rejected')}
                            </span>
                          )}
                        </>
                      )}
                    </div>
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
                  {order.filesDeleted && (
                    <div 
                      onClick={() => setShowCleanedModal(true)}
                      className="p-3 bg-slate-50 text-slate-500 rounded-xl border border-slate-200 text-center text-xs font-bold font-sans cursor-pointer hover:bg-slate-100 transition select-none"
                    >
                      🔒 {t('Storage Cleaned — Files Automatically Removed (Click for Info)')}
                    </div>
                  )}
                </div>

                {/* Footer details & Action buttons */}
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-gray-900 text-base">{formatCurrency(order.totalAmount)}</span>
                    <span className="text-gray-500 text-xs font-semibold flex items-center gap-1">
                      <Clock size={14} className="text-indigo-500" />
                      {t('Queue Position')}: {order.queue ? (order.queue.status === 'DONE' ? t('Done') : `#${order.queue.position}`) : t('Pending')}
                    </span>
                  </div>
                  
                  <div id="bill-actions-group" className="flex flex-wrap gap-2">
                    {/* Scratch Card / Claim Reward (Available for any order with a reward log) */}
                    {order.rewardLog && (
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
                    {/* Bill Request Workflow Buttons */}
                    {order.billStatus === 'SENT' ? (
                      <>
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
                      </>
                    ) : order.billStatus === 'REQUESTED' ? (
                      <button
                        type="button"
                        disabled
                        className="px-3 py-2 rounded-lg text-xs font-bold text-amber-700 bg-amber-50 border border-amber-250 cursor-not-allowed flex items-center gap-1.5"
                      >
                        <Clock size={14} className="animate-spin" />
                        {t('Bill Requested (Awaiting Shopkeeper)')}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleRequestBill(order.id)}
                        className="px-3 py-2 rounded-lg text-xs font-bold text-violet-750 bg-violet-50 border border-violet-250 hover:bg-violet-100 transition flex items-center gap-1.5 active:scale-95 shadow-sm"
                      >
                        <FileText size={14} className="text-violet-650" />
                        {t('Request for Bill/Invoice')}
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
            );
          })}
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
      </main>

      <FeedbackButton />
      
      {showRewardModal && (
        <RewardCardModal 
          orderId={selectedOrderId} 
          onClose={() => {
            setShowRewardModal(false)
            setSelectedOrderId(null)
            if (guideStep === 6) {
              const pendingPayment = orders.some(o => o.status === 'PENDING')
              if (pendingPayment) {
                setGuideStep(7)
              } else {
                setGuideStep(8)
              }
            }
          }}
          onRewardApplied={() => {
            fetchOrders()
          }}
        />
      )}

      {showCleanedModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center relative space-y-4">
            <button 
              onClick={() => setShowCleanedModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={18} />
            </button>
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
              <FileText size={24} />
            </div>
            <h3 className="font-extrabold text-slate-800 text-lg">{t('Storage Cleaned')}</h3>
            <p className="text-xs font-semibold text-slate-500 leading-relaxed">
              {t('The uploaded print documents for this order were automatically and permanently deleted from S3 storage because the order has completed 6 hours.')}
            </p>
            <p className="text-[11px] text-indigo-600 font-bold bg-indigo-50/50 py-2 px-3 rounded-xl border border-indigo-100/60">
              {t('Order history, invoices, and analytics are preserved permanently.')}
            </p>
            <button
              onClick={() => setShowCleanedModal(false)}
              className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-xl transition"
            >
              {t('Got it')}
            </button>
          </div>
        </div>
      )}
      {/* Guided tour overlays */}
      {guideStep !== null && !showRewardModal && (
        <CustomerGuideTour
          activeStep={guideStep}
          targetSelector={guideSelectors[guideStep]}
          text={guideTexts[guideStep]}
          onNext={handleGuideNext}
          onClose={() => {
            setGuideStep(null)
            sessionStorage.setItem('customerGuideSkipped', 'true')
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

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <OrdersPageContent />
    </Suspense>
  )
}