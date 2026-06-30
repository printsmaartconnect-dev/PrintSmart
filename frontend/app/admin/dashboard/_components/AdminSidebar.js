import { 
  LayoutDashboard, 
  Store, 
  ShoppingCart, 
  Gift, 
  Sparkles, 
  HelpCircle, 
  TrendingUp, 
  Settings, 
  Activity, 
  Database,
  Shield,
  CheckCircle2,
  Server,
  Cloud,
  Cpu
} from 'lucide-react';

const navItems = [
  { name: 'Overview', id: 'dashboard', icon: LayoutDashboard },
  { name: 'Shops', id: 'shops', icon: Store },
  { name: 'Orders', id: 'orders', icon: ShoppingCart },
  { name: 'Rewards', id: 'coupons', icon: Gift },
  { name: 'AI Studio', id: 'ai', icon: Sparkles },
  { name: 'Support', id: 'support', icon: HelpCircle },
  { name: 'Revenue', id: 'revenue', icon: TrendingUp },
  { name: 'Analytics', id: 'analytics', icon: Activity },
  { name: 'Settings', id: 'settings', icon: Settings },
];

export default function AdminSidebar({ activeTab, setActiveTab, onShowLogs }) {
  return (
    <aside className="w-64 bg-white border-r border-slate-100 h-screen fixed left-0 top-0 flex flex-col z-20 text-slate-600 font-sans">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20">
            <Shield size={20} className="text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-black tracking-tight text-slate-800 font-brand">
              PrintSmart
            </span>
            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">
              Admin Panel
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl transition-all duration-200 group ${
                isActive 
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20 font-bold' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-semibold'
              }`}
            >
              <item.icon 
                size={18} 
                className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} 
              />
              <span className="text-sm tracking-tight">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Admin Logs Button Area */}
      <div className="p-4.5 border-t border-slate-100 bg-slate-50/30">
        <button 
          onClick={onShowLogs}
          className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4.5 py-3 rounded-xl font-bold text-xs shadow-sm flex items-center justify-center gap-2 group transition-all"
        >
          <Activity size={15} className="text-violet-500 group-hover:scale-110 transition" />
          <span>Admin Activity Logs</span>
        </button>
      </div>
    </aside>
  );
}
