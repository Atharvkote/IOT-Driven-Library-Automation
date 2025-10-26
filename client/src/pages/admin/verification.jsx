"use client"

import { useEffect, useState } from "react"
import { User, BookOpen, Search, Barcode } from "lucide-react"
import { toast } from "sonner"
import { BiRfid } from "react-icons/bi"
import { ToggleSlider } from "../../components/toggle-slider"
import axios from "axios"
import { useSocket } from "../../store/socket-context"

export default function VerifyPage() {
    // Left side state
    const [leftMode, setLeftMode] = useState("prn") // "prn" or "rfid"
    const [prnInput, setPrnInput] = useState("")
    const [rfidData, setRfidData] = useState(null)
    const [leftStudent, setLeftStudent] = useState(null)
    const socket = useSocket()


    useEffect(() => {
        if (!socket) return
        socket.on("new-scan", (data) => {
            console.log("[SOCKET] New RFID Scan:", data)
            toast.success("RFID Scanned Successfully")

            setRfidData(data.student || null)
        })

        return () => socket.off("new-scan")
    }, [socket])

    // Right side state
    const [rightMode, setRightMode] = useState("search") // "search" or "barcode"
    const [searchInput, setSearchInput] = useState("")
    const [barcodeInput, setBarcodeInput] = useState("")
    const [rightData, setRightData] = useState(null)
    const API = import.meta.env.VITE_API_URL;

    // Verification state
    const [isVerifying, setIsVerifying] = useState(false)
    const [verificationResult, setVerificationResult] = useState(null)
    const [showResult, setShowResult] = useState(false)

    // Left side toggle options
    const leftOptions = [
        { id: "prn", label: "PRN Search", icon: <Search className="h-4 w-4" /> },
        { id: "rfid", label: "RFID Auto", icon: <BiRfid className="h-4 w-4" /> },
    ]

    // Right side toggle options
    const rightOptions = [
        { id: "search", label: "Search Bar", icon: <Search className="h-4 w-4" /> },
        { id: "barcode", label: "Barcode", icon: <Barcode className="h-4 w-4" /> },
    ]

    const handleLeftPrnSearch = async () => {
        const idToVerify = prnInput || rfidData?.prn_number
        if (!idToVerify) {
            toast.error("Please enter PRN number or scan RFID")
            return
        }

        try {
            console.log("API:", `${API}/student/verify`, "Payload:", { id: idToVerify })
            const response = await axios.post(`${API}/student/verify`, { id: idToVerify })
            console.log("Response:", response.data)

            const student = response.data?.student;
            console.log("Student:", student)

            if (student) {
                setLeftStudent(student)
                toast.success(response.data?.message || "Student found")
            } else {
                setLeftStudent(null)
                toast.error("Student not found")
            }
        } catch (error) {
            console.error("Student verify error:", error)
            toast.error(error.response?.data?.message || "Error fetching student")
            setLeftStudent(null)
        }
    }


    const handleRightSearch = async () => {
        if (!searchInput.trim()) {
            toast.error("Please enter search query")
            return
        }
        try {
            const response = await axios.get(`${API}/book/${searchInput}`)
            const book = response.data?.book || response.data
            setRightData(book)
            toast.success(response.data?.message || "Book found")
        } catch (error) {
            console.error("Book search error:", error)
            toast.error(error.response?.data?.message || "Error searching book")
        }
    }


    const handleVerify = async () => {
        if (!leftStudent && !rfidData) {
            toast.error("Please provide student information")
            return
        }
        if (!rightData) {
            toast.error("Please provide book information")
            return
        }

        setIsVerifying(true)
        try {
            const response = await axios.post(`${API}/issue/verify`, {
                studentId: leftStudent?._id || rfidData?._id,
                bookId: rightData._id,
            })

            setVerificationResult(response.data)
            setShowResult(true)

            if (response.data.success) {
                toast.success(response.data.message || "Verification successful!")
            } else {
                toast.error(response.data.message || "Verification failed")
            }

        } catch (error) {
            console.error("Verification error:", error)
            toast.error(error.response?.data?.message || "Error during verification")
            setVerificationResult({ success: false, message: "Error occurred" })
            setShowResult(true)
        } finally {
            setIsVerifying(false)
        }
    }




    useEffect(() => {
        console.log("Left Student:", leftStudent)
        console.log("RFID Data:", rfidData)
        console.log("RFID Data:", rightData)
    }, [leftStudent, rfidData, rightData])


    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 lg:p-12 max-w-7xl mx-auto">
                {/* LEFT SIDE - Student/RFID */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <User className="w-6 h-6 text-teal-600" />
                            Student Verification
                        </h2>
                        <ToggleSlider options={leftOptions} value={leftMode} onChange={setLeftMode} />
                    </div>

                    {/* PRN Search Mode */}
                    {leftMode === "prn" && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Enter PRN Number</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={prnInput}
                                        onChange={(e) => setPrnInput(e.target.value)}
                                        placeholder="Enter student PRN..."
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleLeftPrnSearch}
                                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* RFID Auto Mode */}
                    {leftMode === "rfid" && (
                        <div className="space-y-4">
                            <div className="relative w-full aspect-square rounded-2xl border-4 border-dashed border-teal-300 bg-teal-50 flex items-center justify-center overflow-hidden">
                                {/* Animated ripples */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="absolute w-24 h-24 rounded-full bg-teal-300 opacity-50 animate-ping"></div>
                                    <div
                                        className="absolute w-32 h-32 rounded-full bg-teal-200 opacity-30 animate-ping"
                                        style={{ animationDelay: "0.2s" }}
                                    ></div>
                                    <div
                                        className="absolute w-40 h-40 rounded-full bg-teal-100 opacity-20 animate-ping"
                                        style={{ animationDelay: "0.4s" }}
                                    ></div>
                                </div>

                                {/* Central RFID icon */}
                                <div className="relative z-10 text-center">
                                    <div className="w-20 h-20 relative  rounded-full flex items-center justify-center mb-4 mx-auto">
                                        <BiRfid className="w-34 h-34 text-teal-600" />
                                    </div>
                                    <p className="text-lg text-slate-600 font-medium">
                                        Waiting for RFID scan...
                                    </p>
                                    <p className="text-sm text-slate-700 mt-2 font-semibold border-2 border-teal-400 bg-teal-500/30 rounded-2xl px-3 py-1">
                                        • RFID reader active
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Student Details Display */}
                    {(leftStudent || rfidData) && (
                        <div className="mt-6 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-200">
                            <h3 className="font-semibold text-slate-900 mb-4">Student Details</h3>
                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="text-slate-600">Name:</span>{" "}
                                    <span className="font-semibold text-slate-900">{leftStudent?.name || "N/A"}</span>
                                </p>
                                <p>
                                    <span className="text-slate-600">PRN:</span>{" "}
                                    <span className="font-semibold text-teal-700">{leftStudent?.prn_number || "N/A"}</span>
                                </p>
                                <p>
                                    <span className="text-slate-600">Class:</span>{" "}
                                    <span className="font-semibold text-slate-900">{leftStudent?.class || "N/A"}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT SIDE - Book/Barcode */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-teal-600" />
                            Book Verification
                        </h2>
                        <ToggleSlider options={rightOptions} value={rightMode} onChange={setRightMode} />
                    </div>

                    {/* Search Mode */}
                    {rightMode === "search" && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Search Book</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={searchInput}
                                        onChange={(e) => setSearchInput(e.target.value)}
                                        placeholder="Enter book title or ISBN..."
                                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                                    />
                                    <button
                                        onClick={handleRightSearch}
                                        className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
                                    >
                                        Search
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Barcode Mode */}
                    {rightMode === "barcode" && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Scan Barcode</label>
                                <input
                                    type="text"
                                    value={barcodeInput}
                                    onChange={(e) => setBarcodeInput(e.target.value)}
                                    placeholder="Scan barcode here..."
                                    autoFocus
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}

                    {/* Book Details Display */}
                    {rightData && (
                        <div className="mt-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-200">
                            <h3 className="font-semibold text-slate-900 mb-4">Book Details</h3>
                            <div className="space-y-2 text-sm">
                                <p>
                                    <span className="text-slate-600">Title:</span>{" "}
                                    <span className="font-semibold text-slate-900">{rightData?.title || "N/A"}</span>
                                </p>
                                <p>
                                    <span className="text-slate-600">ISBN:</span>{" "}
                                    <span className="font-semibold text-slate-900">{rightData?.isbn || "N/A"}</span>
                                </p>
                                <p>
                                    <span className="text-slate-600">Author:</span>{" "}
                                    <span className="font-semibold text-slate-900">{rightData?.author || "N/A"}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Verification Button */}
            <div className="flex justify-center px-6 py-8">
                <button
                    onClick={handleVerify}
                    disabled={isVerifying || !leftStudent || !rightData}
                    className="px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isVerifying ? "Verifying..." : "Verify & Issue Book"}
                </button>
            </div>

            {/* Verification Result */}
            {showResult && verificationResult && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                    <div
                        className={`bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl border-2 ${verificationResult.success ? "border-green-500" : "border-red-500"
                            }`}
                    >
                        <div className="text-center">
                            <div
                                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${verificationResult.success ? "bg-green-100" : "bg-red-100"
                                    }`}
                            >
                                <span className={`text-3xl ${verificationResult.success ? "text-green-600" : "text-red-600"}`}>
                                    {verificationResult.success ? "✓" : "✕"}
                                </span>
                            </div>
                            <h3
                                className={`text-2xl font-bold mb-2 ${verificationResult.success ? "text-green-600" : "text-red-600"}`}
                            >
                                {verificationResult.success ? "Success!" : "Failed"}
                            </h3>
                            <p className="text-slate-600 mb-6">{verificationResult.message}</p>
                            <button
                                onClick={() => {
                                    setShowResult(false)
                                    if (verificationResult.success) {
                                        setPrnInput("")
                                        setSearchInput("")
                                        setLeftStudent(null)
                                        setRightData(null)
                                    }
                                }}
                                className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
