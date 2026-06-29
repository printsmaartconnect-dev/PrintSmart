import React from 'react';
import { Calendar, TrendingUp, TrendingDown, Hourglass, CheckSquare } from 'lucide-react';

interface PredictionData {
  tomorrowWorkload: {
    ordersCount: number;
    pagesCount: number;
    growthPercentage: number;
  };
  weeklyOutlook: {
    estimatedRevenue: number;
    projectedPagesCount: number;
  };
  recommendations: Array<{
    title: string;
    description: string;
    action: string;
  }>;
}

interface PredictionCardProps {
  predictions: PredictionData;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({ predictions }) => {
  const tomorrowData = predictions.tomorrowWorkload;
  const outlook = predictions.weeklyOutlook;

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950/80 border border-slate-800/80 rounded-2xl p-6 transition-all duration-300">
      
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-violet-500/10 text-violet-400 rounded-xl border border-violet-500/10">
          <Calendar className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight">AI Workload & Demand Forecast</h3>
          <p className="text-xs text-slate-300 font-medium">Data-driven projections for the upcoming cycle</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tomorrow Workload Forecast */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4 hover:border-slate-800 transition-all">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tomorrow's Estimated Volume</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-3xl font-black text-white tracking-tight">{tomorrowData.ordersCount}</span>
              <p className="text-xs text-slate-300 mt-1 font-semibold">Expected Orders</p>
            </div>
            <div>
              <span className="text-3xl font-black text-violet-400 tracking-tight">{tomorrowData.pagesCount}</span>
              <p className="text-xs text-slate-300 mt-1 font-semibold">Expected Pages</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-slate-900">
            <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
              tomorrowData.growthPercentage >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
            }`}>
              {tomorrowData.growthPercentage >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {tomorrowData.growthPercentage >= 0 ? '+' : ''}{tomorrowData.growthPercentage}%
            </span>
            <span className="text-xs text-slate-400 font-medium">than average daily volume</span>
          </div>
        </div>

        {/* Weekly Outlook */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4 hover:border-slate-800 transition-all">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated 7-Day Outlook</h4>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-3xl font-black text-emerald-400 tracking-tight">₹{outlook.estimatedRevenue.toFixed(0)}</span>
              <p className="text-xs text-slate-300 mt-1 font-semibold">Projected Revenue</p>
            </div>
            <div>
              <span className="text-3xl font-black text-cyan-400 tracking-tight">{outlook.projectedPagesCount}</span>
              <p className="text-xs text-slate-300 mt-1 font-semibold">Projected Pages</p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-slate-900">
            <Hourglass className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-400 font-medium">Refreshes dynamically every 6 hours</span>
          </div>
        </div>

      </div>

      {/* Forecast logic suggestion */}
      <div className="mt-6 space-y-3">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Seasonal & Temporal Advisor</h4>
        {predictions.recommendations.map((rec, index) => (
          <div key={index} className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl flex items-start gap-3 hover:border-slate-800 transition-all">
            <CheckSquare className="w-4 h-4 text-violet-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-bold text-white">{rec.title}</span>
              <p className="text-sm text-slate-300 mt-1 leading-relaxed font-normal">{rec.description}</p>
              <p className="text-xs text-indigo-300 mt-2 font-bold">⚡ Recommended action: {rec.action}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
