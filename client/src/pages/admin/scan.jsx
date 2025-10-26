"use client"

import { useEffect, useState } from "react"
import { Clock, User, Mail, Phone, Award, BookOpen } from "lucide-react"
import { useSocket } from "../../store/socket-context"
import { toast } from "sonner"
import { MdDocumentScanner } from "react-icons/md"
import { BiRfid } from "react-icons/bi"

const LatestScan = () => {
  const socket = useSocket()
  const [scan, setScan] = useState(null)
  const [student, setStudent] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!socket) return

    socket.on("new-scan", (data) => {
      toast.success(data.message || "New scan received")
      setScan(data.scan || null)
      setStudent(data.student || null)
    })

    return () => {
      socket.off("new-scan")
    }
  }, [socket])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 p-6">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in flex items-center gap-4">
          <MdDocumentScanner className="w-12 h-12 text-teal-600" />
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Latest Scan Details</h1>
            <p className="text-slate-600 mt-1">Real-time RFID scan information</p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500">
          {/* Waiting State */}
          {!scan && !error && (
            <div className="flex flex-col items-center justify-center py-16 animate-fade-in">
              <div className="w-20 h-20 relative bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <div className="absolute w-16 h-16 animate-ping bg-teal-100 rounded-full"></div>
                <BiRfid className="w-12 h-12 text-teal-600" />
              </div>
              <p className="text-lg text-slate-600 font-medium">Waiting for a scan...</p>
              <p className="text-sm text-slate-700 mt-2 font-semibold border-2 border-teal-400 bg-teal-500/30 rounded-2xl px-3 py-1">
                • RFID reader is active
              </p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4 animate-shake">
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          )}

          {/* Scan Details - Horizontal Layout */}
          {scan && (
            <div className="p-8 space-y-6">
              {/* Top Section: Student Info & Credits */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Student Profile Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                      <User className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-slate-900">{student?.name || "N/A"}</h2>
                      <p className="text-sm text-slate-600 mt-2">
                        PRN: <span className="font-semibold text-teal-700">{student?.prn_number || "N/A"}</span>
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        Roll No: <span className="font-semibold text-teal-700">{student?.rollNo || "N/A"}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Credits Card - Prominent */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-300 shadow-md flex flex-col items-center justify-center">
                  <Award className="w-8 h-8 text-amber-600 mb-2" />
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Total Credits</p>
                  <p className="text-5xl font-bold text-amber-700">{student?.credits || "0"}</p>
                </div>
              </div>

              {/* Middle Section: Academic & Personal Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-all">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Class</p>
                  <p className="text-xl font-bold text-slate-900">{student?.class || "N/A"}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-all">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Section</p>
                  <p className="text-xl font-bold text-slate-900">{student?.section || "N/A"}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-all">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">Gender</p>
                  <p className="text-xl font-bold text-slate-900">{student?.gender || "N/A"}</p>
                </div>
                <div
                  className={`rounded-lg p-4 border-2 font-bold text-center transition-all ${
                    scan.scanType === "in"
                      ? "bg-green-50 border-green-300 text-green-700"
                      : "bg-orange-50 border-orange-300 text-orange-700"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-wide mb-2">Scan Type</p>
                  <p className="text-xl">{scan.scanType === "in" ? "Entry" : "Exit"}</p>
                </div>
              </div>

              {/* Contact & Email Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 bg-blue-50 rounded-lg p-4 border border-blue-200 hover:shadow-md transition-all">
                  <Mail className="w-6 h-6 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Email</p>
                    <p className="font-medium text-slate-900 break-all">{student?.email || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-purple-50 rounded-lg p-4 border border-purple-200 hover:shadow-md transition-all">
                  <Phone className="w-6 h-6 text-purple-600 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Contact</p>
                    <p className="font-medium text-slate-900">{student?.contactNumber || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* RFID & Timestamp Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* RFID Information */}
                <div className="bg-slate-900 rounded-lg p-6 text-white border border-slate-700 hover:shadow-lg transition-all">
                  <h4 className="font-semibold text-sm uppercase tracking-wide text-slate-300 mb-4 flex items-center gap-2">
                    <BiRfid className="w-5 h-5" />
                    RFID Information
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Hex Value</p>
                      <p className="font-mono text-lg font-bold text-teal-400">{scan.rfid?.hex || "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Decimal Value</p>
                      <p className="font-mono text-lg font-bold text-teal-400">{scan.rfid?.decimal || "N/A"}</p>
                    </div>
                  </div>
                </div>

                {/* Timestamp Information */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-4 bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-all">
                    <Clock className="w-6 h-6 text-teal-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Scanned At</p>
                      <p className="font-medium text-slate-900">
                        {scan.scannedAt ? new Date(scan.scannedAt).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-50 rounded-lg p-4 border border-slate-200 hover:shadow-md transition-all">
                    <BookOpen className="w-6 h-6 text-teal-600 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Created At</p>
                      <p className="font-medium text-slate-900">
                        {scan.createdAt ? new Date(scan.createdAt).toLocaleString() : "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-slate-600 animate-fade-in">
          <p>Real-time updates • Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
    </div>
  )
}

export default LatestScan
