import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendText, 
  trendUp, 
  colorClass, 
  bgClass, 
  sparklinePath 
}) {
  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5 relative overflow-hidden flex flex-col justify-between min-h-[160px]">
      
      {/* Background soft glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/0 to-slate-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="p-6 pb-2 relative z-10 flex items-start justify-between">
        <div className="space-y-1.5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-1">
              <span className={`text-xs font-extrabold flex items-center ${trendUp ? 'text-emerald-600' : 'text-rose-500'}`}>
                {trendUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {trend}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">{trendText || 'vs last month'}</span>
            </div>
          )}
        </div>
        
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:rotate-3 ${bgClass}`}>
          <Icon size={20} className={colorClass} />
        </div>
      </div>
      
      {/* Sparkline Graphic at the absolute base of the card */}
      <div className="w-full h-10 mt-auto opacity-80 group-hover:opacity-100 transition-opacity duration-300 relative">
        <svg viewBox="0 0 100 30" className="w-full h-full preserve-aspect-ratio" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`grad-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.12" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          
          {/* Gradient area under the line */}
          <path
            d={`${sparklinePath} L100,30 L0,30 Z`}
            fill={`url(#grad-${title.replace(/\s+/g, '')})`}
            className={colorClass}
          />
          
          {/* Main sparkline line */}
          <path
            d={sparklinePath}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={colorClass}
          />
        </svg>
      </div>
    </div>
  );
}
