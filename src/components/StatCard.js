export default function StatCard({ 
  label, 
  value, 
  accent = "from-amber-400 to-orange-500",
  icon = "📊",
  trend = null,
  trendPositive = true,
  color = "blue",
  size = "default"
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

  const isCompact = size === "compact";

  return (
    <article
      className={`relative rounded-2xl border ${colorMap[color]} backdrop-blur-sm shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg ${
        isCompact ? "p-3.5 md:p-4" : "p-4 md:p-5"
      }`}
    >
      <div className={`absolute right-0 top-0 h-24 w-24 -translate-y-1/2 translate-x-1/3 rounded-full bg-gradient-to-br ${accent} opacity-20 blur-2xl`} />
      
      <div className={`relative flex items-start justify-between ${isCompact ? "gap-2" : "gap-3"}`}>
        <div className="min-w-0 flex-1">
          <p className={`truncate uppercase font-semibold text-slate-600 ${isCompact ? "text-[10px] tracking-[0.1em]" : "text-[11px] tracking-[0.12em]"}`} title={label}>
            {label}
          </p>
          <p
            className={`${textColorMap[color]} mt-1.5 truncate font-bold tabular-nums ${
              isCompact ? "text-lg md:text-xl" : "text-2xl md:text-3xl"
            }`}
            title={String(value)}
          >
            {value}
          </p>
          
          {trend && (
            <p className={`mt-1.5 text-[11px] font-semibold ${trendPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trendPositive ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        
        <div className={`shrink-0 ${textColorMap[color]} ${isCompact ? "text-lg md:text-xl" : "text-2xl md:text-3xl"}`}>
          {icon}
        </div>
      </div>
    </article>
  );
}
