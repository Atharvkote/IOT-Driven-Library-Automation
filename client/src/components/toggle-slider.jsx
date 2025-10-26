"use client"

export function ToggleSlider({ options, value, onChange }) {
  const activeIndex = options.findIndex((opt) => opt.id === value)
  const widthPct = 100 / options.length // e.g. 50% for 2 tabs, 33.33% for 3

  return (
    <div className="relative bg-slate-100 border border-slate-300 px-2 py-1 w-full flex gap-2 rounded-lg justify-evenly overflow-hidden mb-6">
      <div
        className="absolute top-0 left-0 h-full bg-gradient-to-r from-teal-600 to-teal-500 transition-transform duration-300 ease-in-out rounded-md"
        style={{ width: `${widthPct}%`, transform: `translateX(${activeIndex * 100}%)` }}
      />

      {/* Buttons */}
      {options.map((opt) => {
        const isActive = opt.id === value
        return (
          <button
            key={opt.id}
            onClick={() => !opt.disabled && onChange(opt.id)}
            disabled={opt.disabled}
            className={`relative z-10 flex items-center gap-2 px-6 py-2 font-semibold rounded-md text-sm transition-all duration-300 ${
              isActive ? "text-white" : "text-slate-700"
            } ${opt.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {opt.icon}
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

// ✅ Usage
/*
const options = [
  { id: "define", label: "Define PDA", icon: <Settings2 className="h-4 w-4" /> },
  { id: "simulate", label: "Simulate", icon: <PlayCircle className="h-4 w-4" />, disabled: !pda },
];
<ToggleSlider options={options} value={activeTab} onChange={setActiveTab} />
*/
