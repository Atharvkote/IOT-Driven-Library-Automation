"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Users, BookOpen, AlertCircle } from "lucide-react"
import { GiBookmarklet } from "react-icons/gi"
import axios from "axios"
import { toast } from "sonner"

const getStatusColor = (status) => {
  switch (status) {
    case "hot":
      return "bg-red-50 border-red-200 text-red-900"
    case "popular":
      return "bg-amber-50 border-amber-200 text-amber-900"
    case "moderate":
      return "bg-green-50 border-green-200 text-green-900"
    default:
      return "bg-slate-50 border-slate-200 text-slate-900"
  }
}

const getStatusBadgeColor = (status) => {
  switch (status) {
    case "hot":
      return "bg-red-600 text-white"
    case "popular":
      return "bg-amber-600 text-white"
    case "moderate":
      return "bg-green-600 text-white"
    default:
      return "bg-slate-600 text-white"
  }
}

export default function BooksAnalyticsPage() {
  const [books, setBooks] = useState([])
  const [sections, setSections] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedBook, setSelectedBook] = useState(null)
  const [filter, setFilter] = useState("All") // All, hot, popular, moderate

  // Fetch books with stock analytics
  const fetchStockData = async () => {
    try {
      setIsLoading(true)
      const API_URL = import.meta.env.VITE_API_URL;
      const url = `${API_URL}/book/analytics/stock`
      console.log("Fetching stock data from:", url)
      
      const response = await axios.get(url)
      
      if (response.data.success) {
        setBooks(response.data.books || [])
        setSections(response.data.sections || [])
      } else {
        console.error("API returned unsuccessful response:", response.data)
        toast.error("Failed to load stock data")
      }
    } catch (error) {
      console.error("Error fetching stock data:", error)
      console.error("Error details:", {
        message: error.message,
        status: error.response?.status,
        url: error.config?.url,
        data: error.response?.data
      })
      toast.error(`Failed to load stock data: ${error.response?.status || error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStockData()
  }, [])

  // Filter books based on status
  const filteredBooks = filter === "All" 
    ? books 
    : books.filter(book => book.status === filter)

  // Calculate stats
  const stats = [
    {
      label: "Total Books",
      value: books.length,
      change: "+0%",
      icon: <TrendingUp className="w-6 h-6 text-teal-600" />,
    },
    {
      label: "Hot Titles",
      value: books.filter((b) => b.status === "hot").length,
      change: "+0%",
      icon: <AlertCircle className="w-6 h-6 text-red-600" />,
    },
    {
      label: "Total Issues",
      value: books.reduce((sum, b) => sum + (b.timesIssued || 0), 0),
      change: "+0%",
      icon: <BookOpen className="w-6 h-6 text-teal-600" />,
    },
    {
      label: "Total Shelf Visits",
      value: sections.reduce((sum, s) => sum + (s.visits || 0), 0),
      change: "+0%",
      icon: <Users className="w-6 h-6 text-teal-600" />,
    },
  ]

  // Prepare chart data
  const topBooks = books.slice(0, 10)
  const issuesTrendData = topBooks.map((book, idx) => ({
    name: book.title?.substring(0, 15) || `Book ${idx + 1}`,
    issues: book.timesIssued || 0,
    visits: book.shelfVisits || 0,
  }))

  const shelfVisitData = sections.map(s => ({
    name: s.name || "Unknown",
    visits: s.visits || 0,
  }))

  const demandDistribution = [
    { name: "Hot", value: books.filter(b => b.status === "hot").length, fill: "#dc2626" },
    { name: "Popular", value: books.filter(b => b.status === "popular").length, fill: "#f59e0b" },
    { name: "Moderate", value: books.filter(b => b.status === "moderate").length, fill: "#10b981" },
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading stock analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm  top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <GiBookmarklet className="w-12 h-12 text-teal-700" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Book Stock Analytics</h1>
              <p className="text-sm text-slate-600">Track current stock, issue counts, and shelf visits</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 flex-wrap">
            {["All", "hot", "popular", "moderate"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filter === status
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-medium text-slate-600">{stat.label}</p>
                  <p className="text-2xl md:text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                </div>
                {stat.icon}
              </div>
              {stat.change && <p className="text-xs text-teal-600 font-semibold">{stat.change} from last month</p>}
            </div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Issues & Visits Trend Chart */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Top 10 Books: Issues & Visits</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={issuesTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Legend />
                <Line type="monotone" dataKey="issues" stroke="#0d9488" strokeWidth={2} dot={{ fill: "#0d9488" }} />
                <Line type="monotone" dataKey="visits" stroke="#06b6d4" strokeWidth={2} dot={{ fill: "#06b6d4" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Shelf Visits by Section Chart */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Shelf Visits by Section</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={shelfVisitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#64748b" />
                <YAxis stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
                <Bar dataKey="visits" fill="#0d9488" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Demand Distribution & Top Books */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Demand Distribution */}
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Demand Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={demandDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {demandDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #475569",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#f1f5f9" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Top In-Demand Books */}
          <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Top 10 In-Demand Books</h2>
            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {topBooks.map((book) => (
                <button
                  key={book._id}
                  onClick={() => setSelectedBook(book)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${getStatusColor(
                    book.status,
                  )}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold line-clamp-1">{book.title}</h3>
                      <p className="text-sm opacity-75 line-clamp-1">{book.author}</p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ${getStatusBadgeColor(book.status)}`}
                    >
                      {book.demandScore}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Detailed Book Inventory</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Book Title</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Times Issued</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Shelf Visits</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Demand Score</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredBooks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                      No books found
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => (
                    <tr key={book._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900 line-clamp-1">{book.title}</div>
                        <div className="text-sm text-slate-600 line-clamp-1">{book.author}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {book.currentStock}/{book.totalCopies}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{book.timesIssued || 0}</td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">{book.shelfVisits || 0}</td>
                      <td className="px-6 py-4">
                        <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              book.demandScore > 85
                                ? "bg-red-600"
                                : book.demandScore > 70
                                  ? "bg-amber-600"
                                  : "bg-green-600"
                            }`}
                            style={{ width: `${book.demandScore}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-600 font-semibold">{book.demandScore}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(book.status)}`}
                        >
                          {book.status?.charAt(0).toUpperCase() + book.status?.slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Book Details Modal */}
        {selectedBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-8 shadow-2xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-6">{selectedBook.title}</h2>

              <div className="space-y-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-600 font-medium mb-1">Author</p>
                  <p className="text-sm font-semibold text-slate-900">{selectedBook.author}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600 font-medium mb-1">Current Stock</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedBook.currentStock}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600 font-medium mb-1">Total Copies</p>
                    <p className="text-2xl font-bold text-slate-900">{selectedBook.totalCopies}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600 font-medium mb-1">Times Issued</p>
                    <p className="text-2xl font-bold text-teal-600">{selectedBook.timesIssued || 0}</p>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-xs text-slate-600 font-medium mb-1">Shelf Visits</p>
                    <p className="text-2xl font-bold text-teal-600">{selectedBook.shelfVisits || 0}</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-600 font-medium mb-1">Demand Score</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          selectedBook.demandScore > 85
                            ? "bg-red-600"
                            : selectedBook.demandScore > 70
                              ? "bg-amber-600"
                              : "bg-green-600"
                        }`}
                        style={{ width: `${selectedBook.demandScore}%` }}
                      ></div>
                    </div>
                    <span className="text-xl font-bold text-slate-900">{selectedBook.demandScore}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg">
                  <p className="text-xs text-slate-600 font-medium mb-1">Status</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                      selectedBook.status,
                    )}`}
                  >
                    {selectedBook.status?.charAt(0).toUpperCase() + selectedBook.status?.slice(1)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedBook(null)}
                className="w-full px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
