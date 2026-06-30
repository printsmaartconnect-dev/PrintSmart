'use client'

import { Gift } from 'lucide-react'

export default function RewardsAnalyticsChart({ totalRewards = 92821, rewardCost = 2140 }) {
  // SVG Donut Configurations
  const radius = 45
  const circumference = 2 * Math.PI * radius // ~282.7

  // Percentages matching mockup exactly:
  // Did You Know (54%), Astrology (40%), 50% OFF (5%), Free Print (1%)
  const segments = [
    { label: 'Did You Know', percent: 54, color: '#8B5CF6', textClass: 'text-violet-600 bg-violet-50/50' },
    { label: 'Astrology', percent: 40, color: '#10B981', textClass: 'text-emerald-600 bg-emerald-50/50' },
    { label: '50% OFF', percent: 5, color: '#F59E0B', textClass: 'text-amber-600 bg-amber-50/50' },
    { label: 'Free Print', percent: 1, color: '#3B82F6', textClass: 'text-blue-600 bg-blue-50/50' }
  ]

  // Calculate cumulative offsets
  let accumulatedPercent = 0

  return (
    <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm flex flex-col justify-between h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">Rewards Analytics</h3>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Split of public promotional distributions</p>
        </div>
        <button className="text-violet-600 text-xs font-bold hover:underline">
          View Report
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
        {/* SVG Donut */}
        <div className="relative w-36 h-36 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Circle */}
            <circle 
              cx="72" 
              cy="72" 
              r={radius} 
              fill="transparent" 
              stroke="#F1F5F9" 
              strokeWidth="12" 
            />
            {segments.map((seg, idx) => {
              const strokeLength = (seg.percent / 100) * circumference
              const strokeOffset = circumference - strokeLength
              const rotation = (accumulatedPercent / 100) * 360
              accumulatedPercent += seg.percent

              return (
                <circle
                  key={idx}
                  cx="72"
                  cy="72"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth="12"
                  strokeDasharray={`${strokeLength} ${circumference - strokeLength}`}
                  strokeDashoffset="0"
                  className="origin-[72px_72px] transition-all duration-500"
                  style={{
                    transform: `rotate(${rotation}deg)`
                  }}
                />
              )
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[20px] font-black text-slate-800">
              {totalRewards.toLocaleString()}
            </span>
            <span className="text-[8px] text-slate-400 font-extrabold uppercase tracking-widest mt-0.5">
              Total Rewards
            </span>
          </div>
        </div>

        {/* Legend listing */}
        <div className="flex-1 space-y-2.5 w-full">
          {segments.map((seg) => (
            <div 
              key={seg.label} 
              className={`flex items-center justify-between p-2.5 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-700 hover:scale-[1.01] transition-transform`}
            >
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <span>{seg.label}</span>
              </div>
              <span className="font-black text-slate-800">{seg.percent}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Total Reward Cost Metric Card */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-violet-50/50 border border-violet-100 text-xs font-bold text-slate-800">
        <div className="flex items-center gap-2 text-violet-700">
          <Gift size={16} className="fill-violet-100" />
          <span>Total Reward Cost (This Month)</span>
        </div>
        <span className="text-sm font-black text-violet-700">
          ₹{rewardCost.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
