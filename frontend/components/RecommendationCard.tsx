import React, { useState } from 'react';
import { Lightbulb, Tag, ClipboardList, AlertCircle, PlayCircle, Loader2, CheckCircle2 } from 'lucide-react';

interface Recommendation {
  id: string;
  type: "PRICING" | "INVENTORY" | "CUSTOMER" | "PRINTER" | "MARKETING" | "REVENUE";
  priority: "HIGH" | "MEDIUM" | "LOW";
  title: string;
  description: string;
  action: string;
  status: string;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onApplySuccess: (id: string) => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation, onApplySuccess }) => {
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(recommendation.status === 'APPLIED');

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.06)]';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case 'PRICING':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/10';
      case 'INVENTORY':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10';
      case 'PRINTER':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/10';
      case 'REVENUE':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/10';
      default:
        return 'bg-violet-500/10 text-violet-400 border-violet-500/10';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PRICING':
        return <Tag className="w-4 h-4" />;
      case 'INVENTORY':
        return <ClipboardList className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  const handleApply = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com';
      const response = await fetch(`${apiUrl}/api/ai/recommendations/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recommendationId: recommendation.id,
          actionTaken: 'APPLIED'
        })
      });

      if (response.ok) {
        setApplied(true);
        onApplySuccess(recommendation.id);
      }
    } catch (err) {
      console.error('Failed to apply recommendation:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`p-6 bg-gradient-to-b from-slate-900 to-slate-950/90 border rounded-2xl transition-all duration-300 ${
      applied 
        ? 'border-emerald-500/30 shadow-[0_12px_25px_rgba(16,185,129,0.04)] bg-slate-950/60' 
        : 'border-slate-800/80 hover:border-violet-500/20 hover:-translate-y-1 hover:shadow-[0_12px_25px_rgba(139,92,246,0.05)]'
    }`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-lg border ${getTypeStyle(recommendation.type)}`}>
            {getTypeIcon(recommendation.type)}
          </div>
          <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">
            {recommendation.type} Advisor
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wider ${getPriorityStyle(recommendation.priority)}`}>
            {recommendation.priority}
          </span>
          {applied && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              APPLIED
            </span>
          )}
        </div>
      </div>

      <h4 className="mt-4 text-md font-bold text-white tracking-tight leading-snug">{recommendation.title}</h4>
      <p className="mt-2 text-sm text-slate-300 leading-relaxed font-semibold">{recommendation.description}</p>

      {/* Suggested Action Box (glowing borders) */}
      <div className={`mt-4 p-4 rounded-xl flex items-start gap-3 border ${
        applied ? 'bg-slate-950/90 border-slate-900' : 'bg-slate-950 border-slate-850'
      }`}>
        <AlertCircle className="w-4.5 h-4.5 text-indigo-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Recommended Action</span>
          <p className="mt-1 text-sm text-slate-200 font-medium leading-relaxed">{recommendation.action}</p>
        </div>
      </div>

      {/* Action Button */}
      {!applied && (
        <button
          onClick={handleApply}
          disabled={loading}
          className="mt-5 w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <>
              <PlayCircle className="w-4 h-4 text-violet-200 group-hover:scale-110 transition-all duration-200" />
              Apply Recommendation
            </>
          )}
        </button>
      )}
    </div>
  );
};
