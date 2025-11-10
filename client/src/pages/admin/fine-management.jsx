"use client"

import { useState, useEffect } from "react"
import { DollarSign, AlertCircle, CheckCircle, XCircle, Trash2, User, Book, Calendar } from "lucide-react"
import { GiBookmarklet } from "react-icons/gi"
import axios from "axios"
import { toast } from "sonner"

export default function FineManagement() {
  const [fines, setFines] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("All") // All, Paid, Unpaid
  const [deleteConfirm, setDeleteConfirm] = useState(null) // { fineId, fineAmount, studentName, bookTitle }
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    unpaid: 0,
    totalAmount: 0,
    unpaidAmount: 0,
  })

  // Fetch fines from backend
  const fetchFines = async () => {
    try {
      setIsLoading(true)
      let API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
      API_URL = API_URL.replace(/\/$/, '')
      
      let url
      if (API_URL.includes('/api/v1')) {
        url = `${API_URL}/fines`
      } else {
        url = `${API_URL}/api/v1/fines`
      }

      // Add filter query if needed
      if (filter === "Paid") {
        url += "?paid=true"
      } else if (filter === "Unpaid") {
        url += "?paid=false"
      }

      const response = await axios.get(url)
      
      if (response.data.success) {
        setFines(response.data.fines || [])
        setStats({
          total: response.data.total || 0,
          paid: response.data.paid || 0,
          unpaid: response.data.unpaid || 0,
          totalAmount: (response.data.fines || []).reduce((sum, f) => sum + (f.amount || 0), 0),
          unpaidAmount: (response.data.fines || []).filter(f => !f.paid).reduce((sum, f) => sum + (f.amount || 0), 0),
        })
      }
    } catch (error) {
      console.error("Error fetching fines:", error)
      toast.error("Failed to load fines")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchFines()
  }, [filter])

  // Handle fine paid (delete with confirmation)
  const handleFinePaid = (fine) => {
    setDeleteConfirm({
      fineId: fine._id,
      fineAmount: fine.amount,
      studentName: fine.borrowedBook?.student?.name || "Unknown",
      bookTitle: fine.borrowedBook?.book?.title || "Unknown Book",
      reason: fine.reason,
    })
  }

  // Confirm delete
  const confirmDelete = async () => {
    if (!deleteConfirm) return

    try {
      let API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"
      API_URL = API_URL.replace(/\/$/, '')
      
      let url
      if (API_URL.includes('/api/v1')) {
        url = `${API_URL}/fines/${deleteConfirm.fineId}`
      } else {
        url = `${API_URL}/api/v1/fines/${deleteConfirm.fineId}`
      }

      const response = await axios.delete(url)
      
      if (response.data.success) {
        toast.success(`Fine of ₹${deleteConfirm.fineAmount} deleted successfully`)
        setDeleteConfirm(null)
        fetchFines() // Refresh list
      }
    } catch (error) {
      console.error("Error deleting fine:", error)
      toast.error("Failed to delete fine")
    }
  }

  // Cancel delete
  const cancelDelete = () => {
    setDeleteConfirm(null)
  }

  // Format date
  const formatDate = (date) => {
    if (!date) return "N/A"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${amount?.toFixed(2) || "0.00"}`
  }

  // Filter fines
  const filteredFines = filter === "All" 
    ? fines 
    : filter === "Paid"
      ? fines.filter(f => f.paid)
      : fines.filter(f => !f.paid)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading fines...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <GiBookmarklet className="w-12 h-12 text-teal-700" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Fine Management</h1>
              <p className="text-sm text-slate-600">Manage and track library fines</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 flex-wrap">
            {["All", "Unpaid", "Paid"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  filter === status
                    ? "bg-teal-600 text-white shadow-md"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Fines</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{stats.total}</p>
              </div>
              <DollarSign className="w-8 h-8 text-teal-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Unpaid</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{stats.unpaid}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Paid</p>
                <p className="text-2xl font-bold text-green-600 mt-2">{stats.paid}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Amount</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-teal-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Unpaid Amount</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{formatCurrency(stats.unpaidAmount)}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Fines Table */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Fines List</h2>
          </div>
          <div className="overflow-x-auto">
            {filteredFines.length === 0 ? (
              <div className="p-12 text-center">
                <XCircle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-600 mb-2">No Fines Found</h3>
                <p className="text-slate-500">
                  {filter === "All" 
                    ? "There are no fines in the system"
                    : `There are no ${filter.toLowerCase()} fines`}
                </p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Book</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Reason</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Paid At</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-700">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredFines.map((fine) => (
                    <tr key={fine._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="font-medium text-slate-900">
                              {fine.borrowedBook?.student?.name || "Unknown"}
                            </div>
                            <div className="text-sm text-slate-600">
                              {fine.borrowedBook?.student?.prn_number || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Book className="w-4 h-4 text-slate-400" />
                          <div>
                            <div className="font-medium text-slate-900 line-clamp-1">
                              {fine.borrowedBook?.book?.title || "Unknown Book"}
                            </div>
                            <div className="text-sm text-slate-600">
                              {fine.borrowedBook?.book?.author || "N/A"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-lg text-slate-900">
                          {formatCurrency(fine.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700">
                          {fine.reason || "Late return"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {fine.paid ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
                            <CheckCircle className="w-3 h-3" />
                            Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
                            <AlertCircle className="w-3 h-3" />
                            Unpaid
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          {formatDate(fine.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-600">
                          {fine.paidAt ? formatDate(fine.paidAt) : "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {!fine.paid && (
                          <button
                            onClick={() => handleFinePaid(fine)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors text-sm"
                          >
                            <CheckCircle className="w-4 h-4" />
                            Mark as Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Confirm Fine Payment</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600 font-medium mb-1">Student</p>
                <p className="text-sm font-semibold text-slate-900">{deleteConfirm.studentName}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600 font-medium mb-1">Book</p>
                <p className="text-sm font-semibold text-slate-900">{deleteConfirm.bookTitle}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600 font-medium mb-1">Fine Amount</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(deleteConfirm.fineAmount)}</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg">
                <p className="text-xs text-slate-600 font-medium mb-1">Reason</p>
                <p className="text-sm text-slate-700">{deleteConfirm.reason || "Late return"}</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
                <p className="text-sm text-amber-800 font-semibold">
                  ⚠️ Are you sure you want to delete this fine record? This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={cancelDelete}
                className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Yes, Delete Fine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

