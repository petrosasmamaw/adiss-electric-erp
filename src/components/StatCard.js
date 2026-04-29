export default function StatCard({ 
  label, 
  value, 
  accent = "from-amber-400 to-orange-500",
  icon = "📊",
  trend = null,
  trendPositive = true,
  color = "blue"
}) {
  const colorMap = {
    blue: "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50",
    emerald: "border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100/50",
    amber: "border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50",
    rose: "border-rose-200 bg-gradient-to-br from-rose-50 to-rose-100/50",
    purple: "border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100/50",
    cyan: "border-cyan-200 bg-gradient-to-br from-cyan-50 to-cyan-100/50",
  };

  const textColorMap = {
    blue: "text-blue-700",
    emerald: "text-emerald-700",
    amber: "text-amber-700",
    rose: "text-rose-700",
    purple: "text-purple-700",
    cyan: "text-cyan-700",
  };

  return (
    <article className={`relative overflow-hidden rounded-2xl border ${colorMap[color]} backdrop-blur-sm p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}>
      <div className={`absolute right-0 top-0 h-24 w-24 -translate-y-1/2 translate-x-1/3 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl`} />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-widest font-semibold text-slate-600">{label}</p>
          <p className={`mt-3 text-4xl font-bold ${textColorMap[color]}`}>{value}</p>
          
          {trend && (
            <p className={`mt-2 text-xs font-semibold ${trendPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trendPositive ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        
        <div className={`text-4xl ${textColorMap[color]}`}>
          {icon}
        </div>
      </div>
    </article>
  );
}
