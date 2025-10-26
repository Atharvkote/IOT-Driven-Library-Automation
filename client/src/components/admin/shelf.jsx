"use client"

import { BookOpen, Eye } from "lucide-react"


export function LibraryShelf({ id, name, borrowedCount, visitedCount, color }) {
  return (
    <div
      className={`rounded-2xl p-6 ${color} shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between min-h-48`}
    >
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">{name}</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between bg-white/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600" />
            <span className="text-sm font-medium text-slate-700">Borrowed</span>
          </div>
          <span className="text-2xl font-bold text-teal-600">{borrowedCount}</span>
        </div>

        <div className="flex items-center justify-between bg-white/50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-slate-700">Visited</span>
          </div>
          <span className="text-2xl font-bold text-blue-600">{visitedCount}</span>
        </div>
      </div>
    </div>
  )
}
