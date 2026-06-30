'use client'

import { Sparkles, Image, ShieldAlert, Check } from 'lucide-react'

export default function AIUsageOverview({ stats = {} }) {
  // Mock baseline defaults aligned with mockup, combined with actual DB counts if available
  const items = [
    { 
      name: 'AI Poster Maker', 
      uses: 1284 + (stats?.posterMaker || 0), 
      percent: 64, 
      color: 'bg-violet-600', 
      textClass: 'text-violet-600 bg-violet-50' 
    },
    { 
      name: 'AI Banner Maker', 
      uses: 642 + (stats?.bannerMaker || 0), 
      percent: 48, 
      color: 'bg-emerald-500', 
      textClass: 'text-emerald-600 bg-emerald-50' 
    },
    { 
      name: 'Image Enhancer', 
      uses: 248 + (stats?.imageEnhancer || 0), 
      percent: 32, 
      color: 'bg-amber-500', 
      textClass: 'text-amber-600 bg-amber-50' 
    },
    { 
      name: 'Background Remover', 
      uses: 190 + (stats?.bgRemover || 0), 
      percent: 28, 
      color: 'bg-blue-500', 
      textClass: 'text-blue-600 bg-blue-50' 
    }
  ]

  return (
    <div className="bg-white border border-slate-100 rounded-[28px] p-6 shadow-sm flex flex-col justify-between h-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-800">AI Usage Overview</h3>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Platform feature computational metrics</p>
        </div>
        <button className="text-violet-600 text-xs font-bold hover:underline">
          View All
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {items.map((item, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 space-y-3.5 hover:shadow-sm hover:bg-slate-50 transition-all duration-300">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-500 truncate max-w-[100px]">{item.name}</span>
              <div className={`p-1.5 rounded-lg ${item.textClass}`}><Sparkles size={12} /></div>
            </div>
            
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-sm font-black text-slate-800">{item.uses.toLocaleString()}</span>
                <span className="text-[8px] text-slate-400 font-extrabold uppercase">Uses</span>
              </div>
              
              {/* Progress scale */}
              <div className="w-full h-1.5 bg-slate-200/50 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }} />
              </div>
              <span className="text-[8px] text-slate-400 font-bold block mt-1.5">{item.percent}% usage ratio</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
