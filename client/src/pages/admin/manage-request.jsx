import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Check, X, User, Book } from "lucide-react"
import { useSocket } from "../../store/socket-context"
import { GiBookmarklet } from "react-icons/gi"
import { toast } from "sonner"

export default function ManageRequests() {
  const socket = useSocket()
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState("Pending")
  const [expandedUser, setExpandedUser] = useState({})
  const [expandedBook, setExpandedBook] = useState({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!socket) return
    console.log("socket", socket)
    setIsLoading(true)
    socket.emit("getBorrowRequests")

    const handleRequests = (data) => {
      setRequests(data)
      console.log("data", data)
      setIsLoading(false)
    }

    const handleUpdatedRequest = (updatedReq) => {

      setRequests((prev) =>
        prev.map((r) => (r._id === updatedReq._id ? updatedReq : r))
      )
    }

    socket.on("borrowRequests", handleRequests)
    socket.on("borrowRequestsUpdated", handleUpdatedRequest)

    return () => {
      socket.off("borrowRequests", handleRequests)
      socket.off("borrowRequestsUpdated", handleUpdatedRequest)
    }
  }, [socket])

  const filteredRequests = requests.filter((req) => req.status === filter)

  const toggleUserInfo = (id) => {
    setExpandedUser((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const toggleBookInfo = (id) => {
    setExpandedBook((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleApprove = (requestId) => {
    socket.emit("approveBorrowRequest", requestId)
    toast.success("Request approved successfully",);
  }

  const handleReject = (requestId) => {
    socket.emit("rejectBorrowRequest", requestId)
    toast.success("Request rejected!!!",);

  }
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border-amber-200"
      case "Approved":
        return "bg-green-50 text-green-700 border-green-200"
      case "Rejected":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-slate-50 text-slate-700 border-slate-200"
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <GiBookmarklet className="w-12 h-12 text-teal-700" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Manage Borrow Requests</h1>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 flex-wrap">
            {["Pending", "Approved", "Rejected"].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${filter === status
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

      {/* Requests Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
            <GiBookmarklet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-600 mb-2">No {filter} Requests</h2>
            <p className="text-slate-500">There are no {filter.toLowerCase()} borrow requests at the moment</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <div
                key={request._id}
                className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
              >
                {/* Main Info */}
                <div className="p-4 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="bg-teal-100 rounded-full p-2">
                          <GiBookmarklet className="w-5 h-5 text-teal-700" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-lg font-bold text-slate-900 line-clamp-1">
                            {request.book?.title || "Unknown Book"}
                          </h3>
                          <p className="text-sm text-slate-600">{request.student?.name || "Unknown Student"}</p>
                        </div>
                      </div>

                      {/* Key Info */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Borrowed Date</p>
                          <p className="text-sm font-semibold text-slate-900">{formatDate(request.borrowedDate)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Return Date</p>
                          <p className="text-sm font-semibold text-slate-900">
                            {request.longTerm
                              ? "Long-term"
                              : request.expectedReturnDate
                                ? formatDate(request.expectedReturnDate)
                                : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Status</p>
                          <span
                            className={`inline-block px-2 py-1 rounded-full border text-xs font-semibold ${getStatusColor(
                              request.status,
                            )}`}
                          >
                            {request.status}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Request ID</p>
                          <p className="text-xs font-mono text-slate-700 truncate">{request._id.slice(-8)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Toggle Buttons & Actions */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex gap-2 flex-wrap">
                    {/* User Info Toggle */}
                    <button
                      onClick={() => toggleUserInfo(request._id)}
                      className="flex items-center gap-2 px-3 py-2 bg-teal-400 hover:bg-teal-500 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Student Info
                      {expandedUser[request._id] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>

                    {/* Book Info Toggle */}
                    <button
                      onClick={() => toggleBookInfo(request._id)}
                      className="flex items-center gap-2 px-3 py-2 bg-teal-400 hover:bg-teal-500 text-white rounded-lg font-medium text-sm transition-colors"
                    >
                      <Book className="w-4 h-4" />
                      Book Info
                      {expandedBook[request._id] ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Action Buttons */}
                  {filter === "Pending" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(request._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* Expanded User Info */}
                {expandedUser[request._id] && request.student && (
                  <div className="px-4 py-4 bg-blue-50 border-t border-blue-200">
                    <h4 className="font-bold text-slate-900 mb-3">Student Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Name</p>
                        <p className="text-sm font-semibold text-slate-900">{request.student.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">PRN</p>
                        <p className="text-sm font-semibold text-slate-900">{request.student.prn_number}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Class & Section</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {request.student.class} - {request.student.section}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Roll No</p>
                        <p className="text-sm font-semibold text-slate-900">{request.student.rollNo}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Email</p>
                        <p className="text-sm font-semibold text-slate-900">{request.student.email}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Contact</p>
                        <p className="text-sm font-semibold text-slate-900">{request.student.contactNumber}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Gender</p>
                        <p className="text-sm font-semibold text-slate-900">{request.student.gender}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Credits</p>
                        <p className="text-sm font-semibold text-teal-700">{request.student.credits}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expanded Book Info */}
                {expandedBook[request._id] && request.book && (
                  <div className="px-4 py-4 bg-purple-50 border-t border-purple-200">
                    <h4 className="font-bold text-slate-900 mb-3">Book Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Title</p>
                        <p className="text-sm font-semibold text-slate-900">{request.book.title}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Author</p>
                        <p className="text-sm font-semibold text-slate-900">{request.book.author}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">ISBN</p>
                        <p className="text-sm font-mono text-slate-900">{request.book.isbn}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Publisher</p>
                        <p className="text-sm font-semibold text-slate-900">{request.book.publisher}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Section</p>
                        <p className="text-sm font-semibold text-slate-900">{request.book.section}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Genre</p>
                        <p className="text-sm font-semibold text-slate-900">{request.book.genre}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Publication Year</p>
                        <p className="text-sm font-semibold text-slate-900">{request.book.publicationYear}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Available Copies</p>
                        <p className="text-sm font-semibold text-teal-700">
                          {request.book.availableCopies} / {request.book.totalCopies}
                        </p>
                      </div>
                      {request.book.description && (
                        <div className="md:col-span-2">
                          <p className="text-xs text-slate-600 font-medium">Description</p>
                          <p className="text-sm text-slate-700 mt-1">{request.book.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
