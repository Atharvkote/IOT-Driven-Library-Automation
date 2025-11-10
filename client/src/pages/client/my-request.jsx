"use client"

import { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, Clock, AlertCircle, CheckCircle, XCircle, Book } from "lucide-react"
import { useSocket } from "../../store/socket-context"
import { useLibrary } from "../../store/libaray-session"
import { GiBookmarklet } from "react-icons/gi"
import { toast } from "sonner"
import axios from "axios"

export default function MyBookRequests() {
  const socket = useSocket()
  const { student } = useLibrary()
  const [requests, setRequests] = useState([])
  const [filter, setFilter] = useState("All")
  const [expandedRequest, setExpandedRequest] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [studentInfo, setStudentInfo] = useState(null)
  const [useHttpFallback, setUseHttpFallback] = useState(false)

  // HTTP fallback function
  const fetchRequestsViaHttp = async () => {
    if (!student?._id) {
      console.warn("No student ID available for HTTP fallback");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await axios.get(`${API_URL}/api/v1/issue/student/${student._id}`);
      
      if (response.data.success) {
        setRequests(response.data.requests || []);
        setStudentInfo(response.data.student);
        setIsLoading(false);
        console.log("Fetched requests via HTTP fallback:", response.data.requests.length);
      }
    } catch (error) {
      console.error("HTTP fallback error:", error);
      toast.error("Failed to fetch requests");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("Requests updated:", requests);
  }, [requests])

  // Try Socket.IO first, fallback to HTTP
  useEffect(() => {
    if (!student?._id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    let socketTimeout;
    let socketWorked = false;

    // Try Socket.IO first
    if (socket && socket.connected) {
      socket.emit("getMyBorrowRequests");

      const handleRequests = ({ requests: data, student }) => {
        socketWorked = true;
        clearTimeout(socketTimeout);
        setRequests(data || []);
        setStudentInfo(student);
        setIsLoading(false);
        setUseHttpFallback(false);
        console.log("Fetched requests via Socket.IO:", data?.length || 0);
      };

      const handleError = (error) => {
        console.error("Socket error:", error);
        if (!socketWorked) {
          clearTimeout(socketTimeout);
          setUseHttpFallback(true);
          fetchRequestsViaHttp();
        }
      };

      const handleUpdatedRequest = (updatedReq) => {
        setRequests((prev) =>
          prev.map((r) => (r._id === updatedReq._id ? updatedReq : r))
        );
        toast.success("Request status updated");
      };

      socket.on("myBorrowRequests", handleRequests);
      socket.on("myBorrowRequestsError", handleError);
      socket.on("myBorrowRequestUpdated", handleUpdatedRequest);

      // Fallback to HTTP if socket doesn't respond in 3 seconds
      socketTimeout = setTimeout(() => {
        if (!socketWorked) {
          console.log("Socket timeout, using HTTP fallback");
          setUseHttpFallback(true);
          fetchRequestsViaHttp();
        }
      }, 3000);

      return () => {
        clearTimeout(socketTimeout);
        socket.off("myBorrowRequests", handleRequests);
        socket.off("myBorrowRequestsError", handleError);
        socket.off("myBorrowRequestUpdated", handleUpdatedRequest);
      };
    } else {
      // Socket not available, use HTTP immediately
      console.log("Socket not available, using HTTP fallback");
      setUseHttpFallback(true);
      fetchRequestsViaHttp();
    }
  }, [socket, student?._id]) // Re-fetch when socket or student changes


  const filteredRequests = filter === "All" ? requests : requests.filter((req) => req.status === filter)

  const toggleExpanded = (id) => {
    setExpandedRequest((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock className="w-5 h-5 text-amber-600" />
      case "Approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "Rejected":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-slate-600" />
    }
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

  const getStatusMessage = (status) => {
    switch (status) {
      case "Pending":
        return "Your request is being reviewed by the library staff"
      case "Approved":
        return "Your request has been approved! You can now collect the book"
      case "Rejected":
        return "Your request was not approved. Please contact the library for more information"
      default:
        return "Unknown status"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <GiBookmarklet className="w-12 h-12 text-teal-700" />
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">My Book Requests</h1>
              {studentInfo && (
                <p className="text-sm text-slate-600 mt-1">
                  {studentInfo.name} • {studentInfo.prn_number}
                </p>
              )}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-3 flex-wrap">
            {["All", "Pending", "Approved", "Rejected"].map((status) => (
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

          {/* Stats */}
          {studentInfo && (
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-teal-50 rounded-lg p-4 border border-teal-200">
                <p className="text-xs text-teal-600 font-medium">Total Requests</p>
                <p className="text-2xl font-bold text-teal-700 mt-1">{requests.length}</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <p className="text-xs text-amber-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-amber-700 mt-1">
                  {requests.filter((r) => r.status === "Pending").length}
                </p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-xs text-green-600 font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-700 mt-1">
                  {requests.filter((r) => r.status === "Approved").length}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-xs text-red-600 font-medium">Rejected</p>
                <p className="text-2xl font-bold text-red-700 mt-1">
                  {requests.filter((r) => r.status === "Rejected").length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Requests Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {isLoading ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Loading your requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
            <GiBookmarklet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-slate-600 mb-2">No Requests Found</h2>
            <p className="text-slate-500">
              {filter === "All"
                ? "You haven't made any book requests yet"
                : `You have no ${filter.toLowerCase()} requests`}
            </p>
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
                      <div className="flex items-start gap-3 mb-3">
                        <div className="bg-teal-100 rounded-full p-2 flex-shrink-0">
                          <Book className="w-5 h-5 text-teal-700" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-slate-900 line-clamp-2">
                            {request.book?.title || "Unknown Book"}
                          </h3>
                          <p className="text-sm text-slate-600 mt-1">by {request.book?.author || "Unknown Author"}</p>
                        </div>
                      </div>

                      {/* Status and Key Info */}
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(request.status)}
                          <span
                            className={`inline-block px-3 py-1 rounded-full border text-xs font-semibold ${getStatusColor(
                              request.status,
                            )}`}
                          >
                            {request.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">{getStatusMessage(request.status)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Key Details */}
                <div className="px-4 py-3 bg-slate-50 border-t border-slate-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Requested Date</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">{formatDate(request.borrowedDate)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Expected Return</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">
                        {request.longTerm
                          ? "Long-term"
                          : request.expectedReturnDate
                            ? formatDate(request.expectedReturnDate)
                            : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Request ID</p>
                      <p className="text-xs font-mono text-slate-700 mt-1">{request._id.slice(-8)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 font-medium">Request Type</p>
                      <p className="text-sm font-semibold text-slate-900 mt-1">
                        {request.longTerm ? "Long-term" : "Short-term"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Expandable Details */}
                <div className="px-4 py-3 border-t border-slate-100">
                  <button
                    onClick={() => toggleExpanded(request._id)}
                    className="flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium text-sm transition-colors"
                  >
                    <span>Book Details</span>
                    {expandedRequest[request._id] ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Expanded Book Info */}
                {expandedRequest[request._id] && request.book && (
                  <div className="px-4 py-4 bg-teal-50 border-t border-teal-200">
                    <h4 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <GiBookmarklet className="w-4 h-4 text-teal-700" />
                      Book Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Title</p>
                        <p className="text-sm font-semibold text-slate-900 mt-1">{request.book.title}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Author</p>
                        <p className="text-sm font-semibold text-slate-900 mt-1">{request.book.author}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">ISBN</p>
                        <p className="text-sm font-mono text-slate-900 mt-1">{request.book.isbn}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Publisher</p>
                        <p className="text-sm font-semibold text-slate-900 mt-1">{request.book.publisher}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Section</p>
                        <p className="text-sm font-semibold text-slate-900 mt-1">{request.book.section}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Genre</p>
                        <p className="text-sm font-semibold text-slate-900 mt-1">{request.book.genre}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Publication Year</p>
                        <p className="text-sm font-semibold text-slate-900 mt-1">{request.book.publicationYear}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-600 font-medium">Available Copies</p>
                        <p className="text-sm font-semibold text-teal-700 mt-1">
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

                {/* Remarks Section */}
                {request.remarks && (
                  <div className="px-4 py-3 bg-blue-50 border-t border-blue-200">
                    <p className="text-xs text-blue-600 font-medium mb-1">Library Remarks</p>
                    <p className="text-sm text-blue-900">{request.remarks}</p>
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
