import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, User, RefreshCw, BarChart2, Lightbulb, Package, ShieldCheck } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [ownerName, setOwnerName] = useState('Partner');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const account = JSON.parse(localStorage.getItem('shopkeeper') || 'null');
        if (account?.ownerName) {
          setOwnerName(account.ownerName);
        } else if (account?.shopName) {
          setOwnerName(account.shopName);
        }
      } catch (err) {
        // Fallback to default
      }
    }
  }, []);

  const SUGGESTION_CARDS = [
    {
      title: "Today's Earnings",
      desc: "Analyze my revenue performance and order counts for today.",
      prompt: "How much did I earn today? Highlight orders count and key transactions.",
      icon: <BarChart2 className="w-5 h-5 text-blue-400" />
    },
    {
      title: "Paper Stock Alert",
      desc: "Predict stock depletion based on current weekly usage speeds.",
      prompt: "Should I order more paper? What are current inventory levels?",
      icon: <Package className="w-5 h-5 text-purple-400" />
    },
    {
      title: "Pricing Optimizations",
      desc: "Compare profit margins of B&W print against color rates.",
      prompt: "Suggest pricing improvements to maximize profit margins based on pricing rules.",
      icon: <Lightbulb className="w-5 h-5 text-amber-400" />
    },
    {
      title: "Business Health",
      desc: "Perform a systemic audit of pending jobs and health indices.",
      prompt: "How healthy is my business? Calculate current health score and details.",
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages, loading]);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMessage = text.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const apiKey = localStorage.getItem('gemini_api_key') || '';
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://printsmart-3nxm.onrender.com';

      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content
      }));

      const response = await fetch(`${apiUrl}/api/ai/copilot-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'x-gemini-api-key': apiKey
        },
        body: JSON.stringify({
          message: userMessage,
          history
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      } else {
        const err = await response.json();
        setMessages(prev => [
          ...prev, 
          { role: 'assistant', content: `⚠️ Error parsing request: ${err.message || 'Server error'}` }
        ]);
      }
    } catch (err) {
      console.error('Chat API Error:', err);
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: "⚠️ Connection failure. Verify the backend service is running locally." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
  };

  return (
    <div className="bg-[#131314] text-slate-200 rounded-3xl flex flex-col h-[650px] relative overflow-hidden border border-slate-800/40">
      
      {/* Header (Gemini Minimalist style) */}
      <div className="px-6 py-4 bg-[#131314] border-b border-slate-850 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Gemini</span> Copilot
          </span>
          <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-slate-800 text-slate-400 font-bold uppercase tracking-wider">
            Enterprise
          </span>
        </div>

        {messages.length > 0 && (
          <button 
            onClick={handleResetChat}
            className="p-2 hover:bg-slate-900 rounded-full transition-all text-slate-400 hover:text-white"
            title="New Chat"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Conversation viewport */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 custom-scrollbar bg-[#131314]">
        
        {messages.length === 0 ? (
          /* Gemini Empty State Welcome Screen */
          <div className="max-w-3xl mx-auto h-full flex flex-col justify-center py-6 space-y-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-semibold tracking-tight leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent block">
                  Hello, {ownerName}
                </span>
                <span className="text-slate-350 font-semibold block mt-1">How can I assist your print business today?</span>
              </h2>
            </div>

            {/* suggestion cards (Gemini Grid Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              {SUGGESTION_CARDS.map((card, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSend(card.prompt)}
                  className="bg-[#1e1f20] hover:bg-[#282a2c] border border-slate-850 hover:border-slate-800/80 rounded-2xl p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between h-36 group shadow-sm hover:shadow-md"
                >
                  <p className="text-sm font-semibold text-slate-200 leading-snug group-hover:text-white">
                    {card.title}
                    <span className="text-xs font-medium text-slate-300 block mt-1 leading-normal">
                      {card.desc}
                    </span>
                  </p>
                  <div className="flex justify-end pt-2">
                    <div className="p-2.5 bg-[#131314] rounded-xl border border-slate-850 group-hover:scale-110 transition-transform">
                      {card.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Conversation stream rendering */
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.map((m, index) => (
              <div 
                key={index}
                className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* Avatar (for assistant responses) */}
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white shadow-md shadow-purple-600/10">
                    <Sparkles className="w-4.5 h-4.5" />
                  </div>
                )}

                <div className={`leading-relaxed text-[15px] ${
                  m.role === 'user' 
                    ? 'bg-[#2e2f30] text-slate-100 rounded-3xl px-5 py-3.5 max-w-[75%]' 
                    : 'text-slate-200 flex-1 pt-1 font-normal'
                }`}>
                  <div className="whitespace-pre-line space-y-2">
                    {m.content.split('\n').map((line, lIdx) => {
                      let parsedLine: React.ReactNode = line;
                      if (line.startsWith('- ')) {
                        parsedLine = <li className="ml-4 list-disc text-slate-300 font-medium pl-1">{line.substring(2)}</li>;
                      }
                      return <div key={lIdx}>{parsedLine}</div>;
                    })}
                  </div>
                </div>

                {/* User Avatar */}
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-white">
                  <Sparkles className="w-4.5 h-4.5 animate-spin" />
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-sm mt-1.5 font-semibold animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Centered Input Container (Gemini Spec) */}
      <div className="p-6 bg-[#131314] z-10 border-t border-slate-850/40">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
          className="max-w-3xl mx-auto relative flex items-center bg-[#1e1f20] border border-slate-850 focus-within:border-slate-700 rounded-full px-5 py-3 transition-all shadow-lg"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask Gemini Copilot..."
            className="flex-1 bg-transparent text-slate-100 text-[14px] outline-none placeholder-[#8e918f] font-medium pr-10"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className="p-2 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 hover:scale-105 disabled:opacity-30 disabled:scale-100 text-white rounded-full transition-all flex items-center justify-center absolute right-3 shadow-md shadow-purple-600/10 active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <p className="text-[10px] text-center text-slate-400 mt-3 font-semibold">
          Gemini may display inaccurate info, so double-check its recommendations.
        </p>
      </div>

    </div>
  );
};
