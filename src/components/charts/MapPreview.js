"use client";

export default function MapPreview({ label = "Region", amount = "Rs 0.00", width = 340, height = 200 }) {
  return (
    <div className="relative w-full h-full">
      <div className="rounded-xl border border-slate-200 bg-white p-4 h-full flex flex-col justify-between">
        <div className="flex-1">
          <div className="h-36 w-full bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">Map placeholder</div>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-slate-500">{label}</div>
            <div className="text-lg font-bold">{amount}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
