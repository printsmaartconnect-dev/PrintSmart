'use client'

import { useState, useEffect } from 'react'

export default function PlatformGrowthChart({ apiUrl }) {
  const [range, setRange] = useState('daily')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchGrowthData() {
      setLoading(true)
      try {
        const res = await fetch(`${apiUrl}/api/admin/growth?range=${range}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch (err) {
        console.error('Error fetching growth data:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchGrowthData()
  }, [range, apiUrl])

  // Helper to generate bezier curved paths
  function getBezierPath(points) {
    if (points.length === 0) return ''
    let d = `M ${points[0].x},${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i]
      const p1 = points[i + 1]
      // Control points to smooth the transitions
      const cpX1 = p0.x + (p1.x - p0.x) / 3
      const cpY1 = p0.y
      const cpX2 = p0.x + 2 * (p1.x - p0.x) / 3
      const cpY2 = p1.y
      d += ` C ${cpX1},${cpY1} ${cpX2},${cpY2} ${p1.x},${p1.y}`
    }
    return d
  }

  // Calculate coordinates for the SVG path
  const width = 600
  const height = 240
  const paddingLeft = 50
  const paddingRight = 30
  const paddingTop = 20
  const paddingBottom = 40

  const chartWidth = width - paddingLeft - paddingRight
  const chartHeight = height - paddingTop - paddingBottom

  // Find max values for scaling
  const maxOrders = Math.max(...data.map(d => d.orders), 100)
  const maxRevenue = Math.max(...data.map(d => d.revenue), 1000)
  const maxAiUsage = Math.max(...data.map(d => d.aiUsage), 50)
  const maxRewards = Math.max(...data.map(d => d.rewards), 50)

  const ordersPoints = data.map((d, i) => {
    const x = paddingLeft + (i * chartWidth) / (data.length - 1 || 1)
    const y = height - paddingBottom - (d.orders / maxOrders) * chartHeight
    return { x, y }
  })

  const revenuePoints = data.map((d, i) => {
    const x = paddingLeft + (i * chartWidth) / (data.length - 1 || 1)
    const y = height - paddingBottom - (d.revenue / maxRevenue) * chartHeight
    return { x, y }
  })

  const aiPoints = data.map((d, i) => {
    const x = paddingLeft + (i * chartWidth) / (data.length - 1 || 1)
    const y = height - paddingBottom - (d.aiUsage / maxAiUsage) * chartHeight
    return { x, y }
  })

  const rewardsPoints = data.map((d, i) => {
    const x = paddingLeft + (i * chartWidth) / (data.length - 1 || 1)
    const y = height - paddingBottom - (d.rewards / maxRewards) * chartHeight
    return { x, y }
  })

  return (
    <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">Platform Growth</h3>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Real-time usage and financial growth timeline</p>
        </div>
        
        {/* Toggle Pills */}
        <div className="flex bg-slate-50 border border-slate-200 rounded-xl p-1 gap-1 shadow-inner-sm">
          {[
            { id: 'daily', label: 'Daily' },
            { id: 'weekly', label: 'Weekly' },
            { id: 'monthly', label: 'Monthly' },
            { id: 'yearly', label: 'Yearly' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setRange(item.id)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                range === item.id 
                  ? 'bg-violet-600 text-white shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart legends */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-bold">
        <div className="flex items-center gap-1.5 text-violet-600">
          <div className="w-2.5 h-2.5 rounded-full bg-violet-600" />
          <span>Orders</span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-600">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>Revenue</span>
        </div>
        <div className="flex items-center gap-1.5 text-blue-500">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span>AI Usage</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-500">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span>Rewards</span>
        </div>
      </div>

      {/* SVG Multi-line rendering */}
      <div className="w-full relative h-60 bg-slate-50/50 rounded-2xl p-2 border border-slate-100/50">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin"></div>
          </div>
        ) : (
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
            {/* Grid horizontal guidelines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = paddingTop + ratio * chartHeight;
              return (
                <line 
                  key={idx} 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="#E2E8F0" 
                  strokeWidth="0.8" 
                  strokeDasharray="4 4" 
                />
              );
            })}

            {/* Render lines */}
            {data.length > 0 && (
              <>
                {/* Orders - Purple */}
                <path
                  d={getBezierPath(ordersPoints)}
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                
                {/* Revenue - Green */}
                <path
                  d={getBezierPath(revenuePoints)}
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* AI Usage - Blue */}
                <path
                  d={getBezierPath(aiPoints)}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Rewards - Yellow */}
                <path
                  d={getBezierPath(rewardsPoints)}
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Interactive Node Circles for final point */}
                {ordersPoints.length > 0 && (
                  <>
                    <circle cx={ordersPoints[ordersPoints.length - 1].x} cy={ordersPoints[ordersPoints.length - 1].y} r="4" fill="#8B5CF6" stroke="#FFF" strokeWidth="1.5" />
                    <circle cx={revenuePoints[revenuePoints.length - 1].x} cy={revenuePoints[revenuePoints.length - 1].y} r="4" fill="#10B981" stroke="#FFF" strokeWidth="1.5" />
                    <circle cx={aiPoints[aiPoints.length - 1].x} cy={aiPoints[aiPoints.length - 1].y} r="4" fill="#3B82F6" stroke="#FFF" strokeWidth="1.5" />
                    <circle cx={rewardsPoints[rewardsPoints.length - 1].x} cy={rewardsPoints[rewardsPoints.length - 1].y} r="4" fill="#F59E0B" stroke="#FFF" strokeWidth="1.5" />
                  </>
                )}
              </>
            )}

            {/* X-axis labels */}
            {data.map((item, idx) => {
              const x = paddingLeft + (idx * chartWidth) / (data.length - 1 || 1)
              return (
                <text 
                  key={idx} 
                  x={x} 
                  y={height - 12} 
                  textAnchor="middle" 
                  fontSize="9" 
                  fontWeight="bold" 
                  fill="#94A3B8"
                >
                  {item.date}
                </text>
              )
            })}
          </svg>
        )}
      </div>
    </div>
  )
}
