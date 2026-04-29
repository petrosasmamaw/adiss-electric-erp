export default function SectionHeader({ title, subtitle, action, className = "" }) {
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-semibold">{subtitle}</p>
        <h2 className="mt-1 text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">{title}</h2>
      </div>
      {action && <div className="flex gap-2">{action}</div>}
    </div>
  );
}
