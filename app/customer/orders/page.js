'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Inbox, Upload, RotateCcw, Trash2, ArrowLeft, Home } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function OrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [scratchRevealed, setScratchRevealed] = useState(false)
  const canvasRef = useCanvasRef()

  useEffect(() => {
    const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}')
    const storedOrdersRaw = JSON.parse(localStorage.getItem('orders') || '[]')

    // De-dupe any previously duplicated orders (same orderId)
    const seen = new Set()
    const storedOrders = Array.isArray(storedOrdersRaw)
      ? storedOrdersRaw.filter((o) => {
          const id = o?.orderId
          if (!id || seen.has(id)) return false
          seen.add(id)
          return true
        })
      : []

    if (storedOrders.length !== (Array.isArray(storedOrdersRaw) ? storedOrdersRaw.length : 0)) {
      localStorage.setItem('orders', JSON.stringify(storedOrders))
    }

    if (currentOrder.orderId) {
      const exists = storedOrders.some((o) => o?.orderId === currentOrder.orderId)
      const nextOrders = exists ? storedOrders : [...storedOrders, currentOrder]
      localStorage.setItem('orders', JSON.stringify(nextOrders))
      setOrders(nextOrders)
      return
    }

    setOrders(storedOrders)
  }, [])

  const deleteOrder = (orderId) => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    const nextOrders = storedOrders.filter((o) => o?.orderId !== orderId)
    localStorage.setItem('orders', JSON.stringify(nextOrders))
    setOrders(nextOrders)

    const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}')
    if (currentOrder?.orderId === orderId) {
      localStorage.removeItem('currentOrder')
    }
  }

  const deleteFileFromOrder = (orderId, fileIndex) => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    const nextOrders = storedOrders
      .map((o) => {
        if (o?.orderId !== orderId) return o
        const nextFiles = Array.isArray(o.files) ? o.files.filter((_, i) => i !== fileIndex) : []
        return { ...o, files: nextFiles }
      })
      .filter((o) => {
        if (o?.orderId !== orderId) return true
        return Array.isArray(o?.files) ? o.files.length > 0 : true
      })

    localStorage.setItem('orders', JSON.stringify(nextOrders))
    setOrders(nextOrders)

    const currentOrder = JSON.parse(localStorage.getItem('currentOrder') || '{}')
    if (currentOrder?.orderId === orderId) {
      const nextFiles = Array.isArray(currentOrder.files)
        ? currentOrder.files.filter((_, i) => i !== fileIndex)
        : []
      if (nextFiles.length === 0) {
        localStorage.removeItem('currentOrder')
      } else {
        localStorage.setItem('currentOrder', JSON.stringify({ ...currentOrder, files: nextFiles }))
      }
    }
  }

  const handleMouseMove = (e) => {
    if (!scratchRevealed && canvasRef.current) {
      if (canvasRef.current.width <= 0 || canvasRef.current.height <= 0) return

      const rect = canvasRef.current.getBoundingClientRect()
      if (!rect.width || !rect.height) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      const scaleX = canvasRef.current.width / rect.width
      const scaleY = canvasRef.current.height / rect.height

      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(x * scaleX - 15 * scaleX, y * scaleY - 15 * scaleY, 30 * scaleX, 30 * scaleY)

      const imageData = ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height)
      const data = imageData.data
      let transparentPixels = 0

      for (let i = 3; i < data.length; i += 4) {
        if (data[i] < 128) transparentPixels++
      }

      if (transparentPixels > (data.length / 4) * 0.5) {
        setScratchRevealed(true)
      }
    }
  }

  const statusColors = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Accepted: 'bg-blue-100 text-blue-800',
    Printing: 'bg-purple-100 text-purple-800',
    Completed: 'bg-green-100 text-green-800',
  }

  return (
    <div className="wave-bg min-h-screen flex flex-col items-center justify-start px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
      {/* Step Header */}
      <div className="w-full max-w-md sm:max-w-xl lg:max-w-4xl mb-8">
        <div className="step-header">
          <div className="step-number">7</div>
          <div>
            <h1 className="text-3xl font-bold text-black">My Orders</h1>
            <p className="text-gray-600">Track all your print orders in real-time.</p>
          </div>
        </div>
      </div>

      {/* Card Container */}
      <div className="glassmorphism w-full max-w-md sm:max-w-xl lg:max-w-4xl p-6 sm:p-8 lg:p-10">
        {/* Mac Dots */}
        <div className="flex items-center justify-between mb-6">
          <div className="mac-dots">
            <div className="mac-dot red"></div>
            <div className="mac-dot yellow"></div>
            <div className="mac-dot green"></div>
          </div>
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
            aria-label="Back"
            title="Back"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
        </div>

        <h3 className="text-2xl font-bold text-black text-center mb-8">My Orders</h3>

        {/* Scratch Coupon Section */}
        {orders.length > 0 && (
          <div className="mb-8">
            <p className="text-center text-gray-600 text-sm font-medium mb-4">
              Scratch the coupon for amazing rewards
            </p>
            <div
              className="relative w-full h-32 rounded-lg border-2 border-purple-300 border-dashed bg-purple-50 flex items-center justify-center overflow-hidden cursor-crosshair"
              onMouseMove={handleMouseMove}
            >
              <canvas
                ref={canvasRef}
                width={320}
                height={128}
                className="absolute inset-0 scratch-canvas"
              />
              {!scratchRevealed && (
                <div className="text-center z-10">
                  <RotateCcw size={32} className="mx-auto text-purple-600 mb-2" />
                  <p className="text-purple-600 font-bold text-sm">SCRATCH HERE</p>
                </div>
              )}
              {scratchRevealed && (
                <div className="text-center z-10">
                  <p className="text-2xl font-bold text-purple-600">Scratch &amp; earn discounts</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders List */}
        {orders.length > 0 ? (
          <div className="space-y-4 mb-8">
            {orders.map((order, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-bold text-gray-900">{order.orderId}</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => deleteOrder(order.orderId)}
                      className="p-2 rounded-lg hover:bg-gray-200 transition"
                      aria-label="Delete order"
                      title="Delete"
                    >
                      <Trash2 size={18} className="text-gray-600" />
                    </button>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColors['Pending']}`}>
                    Pending
                  </span>
                  </div>
                </div>
                <div className="space-y-2 mb-3">
                  {(Array.isArray(order.files) && order.files.length > 0 ? order.files : ['Untitled document']).map((file, fileIndex) => (
                    <div key={fileIndex} className="flex items-center justify-between gap-3">
                      <p className="text-gray-700 font-medium text-sm truncate flex-1">{file}</p>
                      {Array.isArray(order.files) && order.files.length > 0 && (
                        <button
                          type="button"
                          onClick={() => deleteFileFromOrder(order.orderId, fileIndex)}
                          className="p-2 rounded-lg hover:bg-gray-200 transition"
                          aria-label="Delete document"
                          title="Delete document"
                        >
                          <Trash2 size={18} className="text-gray-600" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-gray-500 text-xs mb-3">
                  {Array.isArray(order.config) ? (
                    <>
                      {Array.isArray(order.files) ? order.files.length : order.config.length} Documents • Multiple configurations
                    </>
                  ) : (
                    <>
                      12 Pages • {order.config?.copies || 2} Copies • {order.config?.paperSize || 'A4'} •{' '}
                      {order.config?.printType === 'bw' ? 'B&W' : 'Color'}
                    </>
                  )}
                </p>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-900">₹{order.price || '10.00'}</span>
                  <span className="text-gray-600 text-xs">10-15 mins</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Inbox size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium">No orders yet</p>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="flex gap-4 justify-between">
          <Link href="/" className="flex-1">
            <button className="w-full py-3 px-4 rounded-lg text-blue-600 font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2">
              <Home size={20} />
              Home
            </button>
          </Link>
          <Link href="/customer/orders" className="flex-1">
            <button className="w-full py-3 px-4 rounded-lg text-blue-600 font-semibold hover:bg-blue-50 transition flex items-center justify-center gap-2">
              <Inbox size={20} />
              Orders
            </button>
          </Link>
          <Link href="/customer/upload" className="flex-1">
            <button className="w-full py-3 px-4 rounded-lg text-gray-600 font-semibold hover:bg-gray-50 transition flex items-center justify-center gap-2">
              <Upload size={20} />
              Upload
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function useCanvasRef() {
  const canvasRef = React.useRef(null)

  React.useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const draw = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const { width, height } = parent.getBoundingClientRect()
      const nextWidth = Math.round(width)
      const nextHeight = Math.round(height)

      if (nextWidth > 0) canvas.width = nextWidth
      if (nextHeight > 0) canvas.height = nextHeight

      if (canvas.width <= 0 || canvas.height <= 0) return

      const ctx = canvas.getContext('2d')
      ctx.fillStyle = '#d4d4d8'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.fillStyle = '#a1a1aa'
      for (let i = 0; i < 20; i++) {
        ctx.fillRect(
          Math.random() * canvas.width,
          Math.random() * canvas.height,
          4,
          4
        )
      }
    }

    draw()

    const ro = new ResizeObserver(() => draw())
    const parent = canvas.parentElement
    if (parent) ro.observe(parent)

    return () => ro.disconnect()
  }, [])

  return canvasRef
}

import React from 'react'