import { 
  LayoutDashboard, 
  Store, 
  Users,
  ShoppingCart, 
  Gift, 
  Sparkles, 
  HelpCircle, 
  TrendingUp, 
  Settings, 
  Activity, 
  Database,
  Shield,
  Activity as ActivityIcon
} from 'lucide-react';

const navItems = [
  { name: 'Overview', id: 'dashboard', icon: LayoutDashboard },
  { name: 'Shops', id: 'shops', icon: Store },
  { name: 'Users', id: 'users', icon: Users },
  { name: 'Orders', id: 'orders', icon: ShoppingCart },
  { name: 'Coupons & Rewards', id: 'coupons', icon: Gift },
  { name: 'AI Usage', id: 'ai', icon: Sparkles },
  { name: 'Support', id: 'support', icon: HelpCircle },
  { name: 'Revenue', id: 'revenue', icon: TrendingUp },
  { name: 'Settings', id: 'settings', icon: Settings },
];

export default function AdminSidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 h-screen fixed left-0 top-0 flex flex-col shadow-xl z-20 text-slate-300">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#6366F1] rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Shield size={20} className="text-white" />
          </div>
          <span className="text-lg font-black tracking-tight text-white font-brand">
            PrintSmart Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">
          Platform Management
        </p>
        
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-[#6366F1] text-white shadow-md shadow-indigo-600/10' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <item.icon 
                size={18} 
                className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`} 
              />
              <span className="font-bold text-sm tracking-tight">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* System Health Card */}
      <div className="p-6 border-t border-slate-800 bg-slate-950/40">
        <div className="bg-slate-900/60 rounded-2xl p-4 border border-slate-800/80 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Health</span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-bold text-emerald-500">Online</span>
            </div>
          </div>
          
          <h4 className="text-white font-extrabold text-xs">All Systems Operational</h4>
          
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/50">
            <div>
              <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Uptime</p>
              <p className="text-xs font-black text-slate-300">99.9%</p>
            </div>
            
            {/* Tiny SVG Micro-Sparkline */}
            <div className="w-16 h-6">
              <svg viewBox="0 0 100 30" className="w-full h-full text-emerald-500">
                <path
                  d="M0,25 Q15,10 30,22 T60,5 T90,18 L100,12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-3 pt-2 text-[9px] font-bold text-slate-500 border-t border-slate-800/50">
            <Database size={10} />
            <span>Backup: Today, 02:15 AM</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
