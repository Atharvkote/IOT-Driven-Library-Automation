"use client"

import { useState, useEffect } from "react"
import { LibraryShelf } from "../../components/admin/shelf"
import { BookOpen } from "lucide-react"
import { io } from "socket.io-client"

const socket = io("http://localhost:5000") // change to your server URL

const shelfColors = [
  "bg-gradient-to-br from-teal-100 to-teal-200",
  "bg-gradient-to-br from-cyan-100 to-cyan-200",
  "bg-gradient-to-br from-emerald-100 to-emerald-200",
  "bg-gradient-to-br from-blue-100 to-blue-200",
  "bg-gradient-to-br from-indigo-100 to-indigo-200",
  "bg-gradient-to-br from-violet-100 to-violet-200",
]

export default function LibraryDashboard() {
  const [shelves, setShelves] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Default shelves
    const mockShelves = [
      { id: "1", name: "Computer Science", borrowedCount: 5, visitedCount: 0, color: shelfColors[0] },
      { id: "2", name: "Mechanical Engineering", borrowedCount: 0, visitedCount: 0, color: shelfColors[1] },
      { id: "3", name: "History", borrowedCount: 0, visitedCount: 0, color: shelfColors[2] },
      { id: "4", name: "Technology", borrowedCount: 0, visitedCount: 0, color: shelfColors[3] },
      { id: "5", name: "Arts", borrowedCount: 0, visitedCount: 0, color: shelfColors[4] },
      { id: "6", name: "Reference", borrowedCount: 0, visitedCount: 0, color: shelfColors[5] },
    ]

    setShelves(mockShelves)
    setLoading(false)

    // Request section stats from server
    socket.emit("getSectionStats")

    socket.on("sectionStats", (data) => {
      // Only update Computer Science shelf
      const updatedShelves = mockShelves.map((shelf) => {
        if (shelf.name === "Computer Science" && data.length > 0) {
          const csData = data[0]
          return {
            ...shelf,
            borrowedCount: 5,
            visitedCount: csData.visitCount,
          }
        }
        return shelf
      })

      setShelves(updatedShelves)
    })

    socket.on("sectionStatsError", (err) => {
      console.error(err.message)
    })

    return () => {
      socket.off("sectionStats")
      socket.off("sectionStatsError")
    }
  }, [])


  const totalBorrowed = shelves.reduce((sum, shelf) => sum + shelf.borrowedCount, 0)
  const totalVisited = shelves.reduce((sum, shelf) => sum + shelf.visitedCount, 0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-teal-600 rounded-lg">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Library Dashboard</h1>
          </div>
          <p className="text-slate-600 text-lg">Explore our collection across different sections</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 ">
            <p className="text-slate-600 text-sm font-medium mb-2">Total Books Borrowed</p>
            <p className="text-4xl font-bold text-teal-600">{totalBorrowed}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 ">
            <p className="text-slate-600 text-sm font-medium mb-2">Total Books Visited</p>
            <p className="text-4xl font-bold text-blue-600">{totalVisited}</p>
          </div>
        </div>

        {/* Shelves Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shelves.map((shelf) => (
              <LibraryShelf
                key={shelf.id}
                id={shelf.id}
                name={shelf.name}
                borrowedCount={shelf.borrowedCount}
                visitedCount={shelf.visitedCount}
                color={shelf.color}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
