export default function Card({ children, className = "", variant = "default", ...props }) {
  const variants = {
    default: "rounded-2xl border border-slate-200/40 bg-white/70 backdrop-blur-xl shadow-sm hover:shadow-md transition-shadow",
    glass: "rounded-2xl border border-white/30 bg-white/40 backdrop-blur-xl shadow-lg",
    gradient: "rounded-2xl border border-white/30 bg-gradient-to-br from-white/80 to-slate-50/80 backdrop-blur-xl shadow-lg",
    elevated: "rounded-2xl border border-slate-200/50 bg-white shadow-lg shadow-slate-200/50 hover:shadow-xl transition-shadow",
  };

  return (
    <div className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </div>
  );
}
