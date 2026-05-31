export default function StatCard({ title, value, icon: Icon, trend, trendUp, colorClass, bgClass }) {
  return (
    <div className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 group hover:-translate-y-1">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-gray-900 mb-3">{value}</h3>
          
          {trend && (
            <div className="flex items-center gap-1.5">
              <span className={`text-sm font-semibold flex items-center gap-1 ${trendUp ? 'text-green-600' : 'text-red-500'}`}>
                {trendUp ? '↑' : '↓'} {trend}%
              </span>
              <span className="text-sm text-gray-400">from last month</span>
            </div>
          )}
        </div>
        
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 ${bgClass}`}>
          <Icon size={26} className={colorClass} />
        </div>
      </div>
    </div>
  );
}
