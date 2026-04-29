import { forwardRef } from "react";

const InputField = forwardRef(
  (
    {
      label,
      error,
      icon,
      className = "",
      type = "text",
      containerClass = "",
      ...props
    },
    ref
  ) => {
    return (
      <div className={`flex flex-col gap-2 ${containerClass}`}>
        {label && (
          <label className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`w-full px-4 py-2.5 ${
              icon ? "pl-10" : ""
            } rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-500">{error}</span>}
      </div>
    );
  }
);

InputField.displayName = "InputField";

export default InputField;
