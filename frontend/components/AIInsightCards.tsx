import React from 'react';
import { Activity, AlertTriangle, CheckCircle, Package } from 'lucide-react';

interface AIInsightCardsProps {
  summary: {
    averageOrderValue: number;
    colorPrintPercentage: number;
  };
  inventory: Array<{
    itemName: string;
    quantity: number;
    unit: string;
    status: string;
  }>;
  printers: Array<{
    printerName: string;
    pagesPrinted: number;
    inkLevel: number;
    status: string;
  }>;
}

export const AIInsightCards: React.FC<AIInsightCardsProps> = ({ summary, inventory, printers }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* Printer Statistics & Operations */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950/80 border border-slate-800/80 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/10">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Printer Monitor & Health</h3>
            <p className="text-xs text-slate-300 font-medium">Real-time status of connected printing units</p>
          </div>
        </div>

        <div className="space-y-4">
          {printers.map((printer, index) => (
            <div key={index} className="flex flex-col p-4 bg-slate-950/80 border border-slate-900 rounded-xl space-y-3 hover:border-slate-800 transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-semibold text-white text-sm tracking-tight">{printer.printerName}</h4>
                  <p className="text-xs text-slate-300 mt-0.5 font-medium">{printer.pagesPrinted.toLocaleString()} lifetime pages</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  printer.status === 'ONLINE' 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border-rose-500/20 animate-pulse'
                }`}>
                  {printer.status}
                </span>
              </div>
              
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1.5 font-medium">
                  <span>Ink / Toner Level</span>
                  <span className={printer.inkLevel <= 15 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-100 font-bold'}>
                    {printer.inkLevel.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-850">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      printer.inkLevel <= 15 ? 'bg-rose-500' : printer.inkLevel <= 30 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`} 
                    style={{ width: `${printer.inkLevel}%` }}
                  />
                </div>
              </div>
            </div>
          ))}

          {printers.length === 0 && (
            <div className="bg-slate-900/80 border border-cyan-500/30 backdrop-blur-md rounded-xl p-8 text-center shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all hover:scale-[1.01]">
              <p className="text-cyan-400 font-bold tracking-wide drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
                No active printers detected. Connect via local network agent.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Inventory & Consumables Advisor */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950/80 border border-slate-800/80 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/10">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Stock Level Advisor</h3>
            <p className="text-xs text-slate-300 font-medium">Consumables limits and replenishment suggestions</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inventory.map((item, index) => (
            <div 
              key={index} 
              className={`flex items-center gap-4 p-4 border rounded-xl bg-slate-950/85 hover:border-slate-800 transition-all ${
                item.status === 'LOW' ? 'border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.03)]' : 'border-slate-900'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                item.status === 'LOW' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-900 text-slate-400'
              }`}>
                {item.status === 'LOW' ? <AlertTriangle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white text-sm truncate tracking-tight">{item.itemName}</h4>
                <p className="text-xs text-slate-300 mt-0.5">
                  Stock: <span className="font-bold text-white">{item.quantity}</span> {item.unit}
                </p>
              </div>
              {item.status === 'LOW' && (
                <span className="text-[9px] font-black text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 animate-pulse">
                  LOW
                </span>
              )}
            </div>
          ))}

          {inventory.length === 0 && (
            <div className="col-span-2 bg-slate-900/80 border border-violet-500/30 backdrop-blur-md rounded-xl p-8 text-center shadow-[0_0_15px_rgba(139,92,246,0.15)] transition-all hover:scale-[1.01]">
              <p className="text-violet-400 font-bold tracking-wide drop-shadow-[0_0_8px_rgba(167,139,250,0.4)]">
                No inventory entries setup. Click "Add Inventory" on your Copilot dashboard.
              </p>
            </div>
          )}
        </div>

        {/* Dynamic margin insights (glassmorphic boxes) */}
        <div className="mt-6 p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-semibold">Color Print Ratio</span>
            <span className="font-bold text-white bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              {summary.colorPrintPercentage.toFixed(1)}% of total
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-semibold">Average Order Value</span>
            <span className="font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2.5 py-1 rounded-lg">
              ₹{summary.averageOrderValue.toFixed(2)}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
