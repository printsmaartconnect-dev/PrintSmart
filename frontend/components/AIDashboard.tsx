import React from 'react';
import { DollarSign, FileText, Clock, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';

interface AIDashboardProps {
  summary: {
    revenueToday: number;
    revenueYesterday: number;
    revenueWeekly: number;
    revenueMonthly: number;
    revenueGrowth: number;
    averageOrderValue: number;
    pendingOrders: number;
    cancelledOrders: number;
    colorPrintPercentage: number;
  };
  healthScore: number;
}

export const AIDashboard: React.FC<AIDashboardProps> = ({ summary, healthScore }) => {
  const getHealthText = (score: number) => {
    if (score >= 80) return 'Optimal Performance';
    if (score >= 50) return 'Attention Suggested';
    return 'Action Critical';
  };

  // SVG parameters for the radial ring
  const radius = 32;
  const strokeWidth = 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (healthScore / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Today's Revenue */}
        <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950/80 border border-slate-800/80 rounded-2xl p-6 transition-all duration-300 hover:border-violet-500/30 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(139,92,246,0.08)] group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-300 group-hover:bg-violet-600/20"></div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">Today's Earnings</span>
            <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-xl group-hover:scale-110 transition-all duration-300 border border-violet-500/10">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">₹{summary.revenueToday.toFixed(2)}</span>
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              summary.revenueGrowth >= 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              {summary.revenueGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {Math.abs(summary.revenueGrowth).toFixed(1)}%
            </span>
          </div>
          <div className="mt-4 text-xs text-slate-400 border-t border-slate-900 pt-3 flex justify-between">
            <span>Yesterday</span>
            <span className="text-slate-300 font-semibold">₹{summary.revenueYesterday.toFixed(2)}</span>
          </div>
        </div>

        {/* Weekly Total */}
        <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950/80 border border-slate-800/80 rounded-2xl p-6 transition-all duration-300 hover:border-cyan-500/30 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(6,182,212,0.08)] group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-600/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-300 group-hover:bg-cyan-600/20"></div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">Weekly Business</span>
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl group-hover:scale-110 transition-all duration-300 border border-cyan-500/10">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-white tracking-tight">₹{summary.revenueWeekly.toFixed(2)}</span>
          </div>
          <div className="mt-4 text-xs text-slate-400 border-t border-slate-900 pt-3 flex justify-between">
            <span>Monthly Sum</span>
            <span className="text-slate-300 font-semibold">₹{summary.revenueMonthly.toFixed(0)}</span>
          </div>
        </div>

        {/* Pending Queue */}
        <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950/80 border border-slate-800/80 rounded-2xl p-6 transition-all duration-300 hover:border-amber-500/30 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(245,158,11,0.08)] group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-600/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-300 group-hover:bg-amber-600/20"></div>
          <div className="flex items-center justify-between">
            <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">Order Backlog</span>
            <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-xl group-hover:scale-110 transition-all duration-300 border border-amber-500/10">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">{summary.pendingOrders}</span>
            <span className="text-xs font-bold text-slate-400">jobs pending</span>
          </div>
          <div className="mt-4 text-xs text-slate-400 border-t border-slate-900 pt-3 flex justify-between">
            <span>Weekly Cancelled</span>
            <span className="text-slate-300 font-semibold">{summary.cancelledOrders}</span>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950/80 border border-slate-800/80 rounded-2xl p-5 transition-all duration-300 hover:border-emerald-500/30 hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(16,185,129,0.08)] flex items-center justify-between gap-4 group">
          <div className="space-y-1">
            <span className="text-slate-300 text-xs font-bold uppercase tracking-wider block">Health Score</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-extrabold text-white tracking-tight">{healthScore}</span>
              <span className="text-sm font-bold text-slate-400">/100</span>
            </div>
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold py-0.5 rounded-md ${
              healthScore >= 80 ? 'text-emerald-400' : healthScore >= 50 ? 'text-amber-400' : 'text-rose-400'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {getHealthText(healthScore)}
            </span>
          </div>

          {/* Radial SVG Ring */}
          <div className="relative flex items-center justify-center w-20 h-20">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="stroke-slate-800/80 fill-none"
                strokeWidth={strokeWidth}
              />
              <circle
                cx="40"
                cy="40"
                r={radius}
                className="fill-none transition-all duration-1000 ease-out"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke={`url(#healthGradient-${healthScore})`}
              />
              <defs>
                <linearGradient id={`healthGradient-${healthScore}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" style={{ stopColor: healthScore >= 80 ? '#10b981' : healthScore >= 50 ? '#f59e0b' : '#f43f5e' }} />
                  <stop offset="100%" style={{ stopColor: healthScore >= 80 ? '#14b8a6' : healthScore >= 50 ? '#f97316' : '#dc2626' }} />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-xs font-black text-white">{healthScore}%</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
