'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Sparkles, Brain, ClipboardList, MessageSquare, ArrowLeft, Key, AlertCircle, RefreshCw } from 'lucide-react';

// Import newly created components
import { AIDashboard } from '../../../components/AIDashboard';
import { AIInsightCards } from '../../../components/AIInsightCards';
import { RecommendationCard } from '../../../components/RecommendationCard';
import { PredictionCard } from '../../../components/PredictionCard';
import { AIChat } from '../../../components/AIChat';
import { useSocket } from '../../../hooks/useSocket';
import { useSocketContext } from '../../../contexts/SocketProvider';

export default function AICopilotPage() {
  const { t } = useTranslation();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'chat'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [copilotData, setCopilotData] = useState<any>(null);
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [customKey, setCustomKey] = useState('');

  const { joinRoom, leaveRoom } = useSocketContext();

  useEffect(() => {
    const loggedIn = localStorage.getItem("loggedInShopkeeper");
    if (loggedIn) {
      try {
        const shop = JSON.parse(loggedIn);
        if (shop && shop.id) {
          joinRoom(`shop:${shop.id}`);
          return () => {
            leaveRoom(`shop:${shop.id}`);
          };
        }
      } catch (e) {
        console.error("Failed to parse shopkeeper for socket join:", e);
      }
    }
  }, [joinRoom, leaveRoom]);

  useSocket("ai-summary-updated", (data) => {
    console.log("[Socket] Received AI summary update:", data);
    setCopilotData(data);
  });

  useSocket("inventory-updated", (updatedItem) => {
    console.log("[Socket] Received inventory update:", updatedItem);
    setCopilotData((prev: any) => {
      if (!prev || !prev.inventory) return prev;
      return {
        ...prev,
        inventory: prev.inventory.map((item: any) =>
          item.itemName === updatedItem.itemName ? { ...item, quantity: updatedItem.quantity } : item
        )
      };
    });
  });

  useSocket("printer-status", (updatedPrinter) => {
    console.log("[Socket] Received printer status update:", updatedPrinter);
    setCopilotData((prev: any) => {
      if (!prev || !prev.printers) return prev;
      return {
        ...prev,
        printers: prev.printers.map((p: any) =>
          p.printerName === updatedPrinter.printerName
            ? { ...p, pagesPrinted: updatedPrinter.pagesPrinted, inkLevel: updatedPrinter.inkLevel, status: updatedPrinter.status }
            : p
        )
      };
    });
  });

  const fetchCopilotData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        router.replace('/shopkeeper/login');
        return;
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com';
      const response = await fetch(`${apiUrl}/api/ai/copilot-dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCopilotData(data);
      } else {
        const errText = await response.text();
        setError(`Failed to fetch copilot data: ${errText}`);
      }
    } catch (err: any) {
      console.error(err);
      setError('Connection refused. Verify the backend Express server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('gemini_api_key') || '';
      setCustomKey(savedKey);
    }
    fetchCopilotData();
  }, []);

  const handleSaveApiKey = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('gemini_api_key', customKey.trim());
      setShowKeyInput(false);
      alert('Gemini API key saved to local session.');
    }
  };

  const handleApplySuccess = (recId: string) => {
    if (copilotData) {
      setCopilotData({
        ...copilotData,
        recommendations: copilotData.recommendations.map((r: any) =>
          r.id === recId ? { ...r, status: 'APPLIED' } : r
        )
      });
      setTimeout(() => {
        fetchCopilotData();
      }, 1000);
    }
  };

  if (loading && !copilotData) {
    return (
      <div className="min-h-screen bg-black text-slate-100 flex flex-col items-center justify-center space-y-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border-4 border-violet-500/20"></div>
          <div className="absolute inset-0 rounded-full border-4 border-violet-500 border-t-transparent animate-spin"></div>
        </div>
        <p className="text-sm font-semibold text-slate-400 tracking-wider uppercase animate-pulse">Syncing Business Brain...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 pb-20 relative overflow-hidden">

      {/* Dynamic Background Mesh Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[150px] -z-10 animate-pulse duration-[8s]"></div>
      <div className="absolute top-[40%] right-[-10%] w-[700px] h-[700px] bg-indigo-600/8 rounded-full blur-[180px] -z-10 animate-pulse duration-[10s]"></div>

      {/* Glassmorphic Sticky Header */}
      <header className="border-b border-slate-900 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 md:py-0 md:h-20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/shopkeeper/dashboard')}
                className="p-2.5 bg-slate-900 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all text-slate-400 hover:text-white"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-tr from-violet-600 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-600/20">
                  <Brain className="w-5.5 h-5.5 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-extrabold text-white tracking-tight leading-tight">PrintSmaart AI Copilot</h1>
                  <p className="text-[10px] font-bold text-violet-400 uppercase tracking-wider block mt-1">
                    Senior Business Architect Engine
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowKeyInput(!showKeyInput)}
              className="flex items-center gap-2 text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 transition-all active:scale-[0.97]"
            >
              <Key className="w-4 h-4 text-violet-400" />
              {customKey ? 'Gemini Key Active' : 'Configure Gemini Key'}
            </button>

            <button
              onClick={fetchCopilotData}
              className="p-2.5 bg-slate-900 border border-slate-800 hover:border-slate-750 rounded-xl transition-all text-slate-200 hover:text-white active:scale-[0.95]"
              title="Refresh Analytics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* API Key Modal Banner (glowing) */}
      {showKeyInput && (
        <div className="max-w-7xl mx-auto px-6 mt-6">
          <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-violet-500/20 rounded-2xl flex flex-col md:flex-row items-center gap-4 justify-between shadow-lg shadow-violet-600/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg">
                <Key className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">Supply Custom Google Gemini API Key</h4>
                <p className="text-xs text-slate-300 mt-0.5 font-medium">Key is saved securely inside your browser's localStorage session.</p>
              </div>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="password"
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="AIzaSy..."
                className="bg-black border border-slate-800/80 rounded-xl px-4 py-2 text-sm text-white focus:border-violet-500 outline-none w-full md:w-64 font-mono"
              />
              <button
                onClick={handleSaveApiKey}
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all active:scale-[0.97]"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-white">System Synchronize Alert</h4>
              <p className="text-xs text-rose-300/80 mt-1 font-medium">{error}</p>
            </div>
          </div>
        )}

        {copilotData && (
          <>
            {/* Top statistics rows */}
            <AIDashboard summary={copilotData.summary} healthScore={copilotData.healthScore} />

            {/* Navigation Tabs (pill styling) */}
            <div className="flex flex-wrap border-b border-slate-900 gap-4 sm:gap-6">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all duration-200 ${activeTab === 'dashboard' ? 'border-violet-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
              >
                <ClipboardList className="w-4 h-4" />
                Intelligence & Projections
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`pb-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-all duration-200 ${activeTab === 'chat' ? 'border-violet-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
              >
                <MessageSquare className="w-4 h-4" />
                Conversational Copilot
              </button>
            </div>

            {/* Tab Contents */}
            {activeTab === 'dashboard' ? (
              <div className="space-y-8">

                {/* Insights and Monitors */}
                <AIInsightCards
                  summary={copilotData.summary}
                  inventory={copilotData.inventory}
                  printers={copilotData.printers}
                />

                {/* AI Predictions */}
                <PredictionCard predictions={copilotData.predictions} />

                {/* Recommendations Grid */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4.5 h-4.5 text-violet-400 animate-pulse" />
                    <h3 className="text-base font-bold text-white tracking-tight">Strategic AI Advisor Actions</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {copilotData.recommendations.map((rec: any, idx: number) => (
                      <RecommendationCard
                        key={idx}
                        recommendation={rec}
                        onApplySuccess={handleApplySuccess}
                      />
                    ))}
                  </div>
                  {copilotData.recommendations.length === 0 && (
                    <div className="text-center py-12 bg-slate-950 border border-slate-900 rounded-2xl text-slate-300 text-sm font-semibold">
                      No pending strategic recommendations. Your operations are currently in an optimal state!
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="max-w-4xl mx-auto w-full">
                <AIChat />
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}
