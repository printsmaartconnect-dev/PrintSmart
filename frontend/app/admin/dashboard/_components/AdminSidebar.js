import { 
  LayoutDashboard, 
  ShoppingCart, 
  Users, 
  Settings,
  CreditCard,
  PieChart,
  Crown
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', id: 'dashboard', icon: LayoutDashboard },
  { name: 'Users & Shops', id: 'users', icon: Users },
  { name: 'Analytics', id: 'analytics', icon: PieChart },
  { name: 'Settings', id: 'settings', icon: Settings },
];

export default function AdminSidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-64 bg-white/80 backdrop-blur-xl border-r border-white/20 h-screen fixed left-0 top-0 flex flex-col shadow-xl z-20">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-gray-100/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Crown size={20} className="text-white" />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700">
            PrintSmart Admin
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
          Platform Management
        </p>
        
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 shadow-sm' 
                  : 'text-gray-600 hover:bg-gray-50/80 hover:text-blue-600'
              }`}
            >
              <item.icon 
                size={20} 
                className={`transition-colors duration-300 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'}`} 
              />
              <span className="font-semibold">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Premium Upgrade Badge Concept */}
      <div className="p-6">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100/50 relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500" />
          <h4 className="text-indigo-900 font-bold mb-1">System Health</h4>
          <p className="text-indigo-600/80 text-sm mb-3">All services operational</p>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs font-semibold text-green-700">Online</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
