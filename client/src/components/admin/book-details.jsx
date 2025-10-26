"use client"

import { useState, useEffect, useRef } from "react"
import { Download, Copy, ArrowLeft, Book, User, Barcode, Package, Clock, FileText } from "lucide-react"
import { useSocket } from "../../store/socket-context"
import { GiBookmarklet } from "react-icons/gi"
import JsBarcode from "jsbarcode"
import { toast } from "sonner"
import { Link, useParams } from "react-router-dom"

export default function BookDetails() {
    const { id } = useParams();
    const socket = useSocket()
    const [book, setBook] = useState(null)
    const [barcode, setBarcode] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    const barcodeRef = useRef(null)

    useEffect(() => {
        if (!socket || !id) return

        setIsLoading(true)
        socket.emit("getBookDetails", id)

        const handleBookDetails = (bookData) => {
            setBook(bookData)
            setIsLoading(false)
            generateBarcode(bookData._id)
        }

        socket.on("bookDetails", handleBookDetails)

        return () => {
            socket.off("bookDetails", handleBookDetails)
        }
    }, [socket, id])

    const generateBarcode = (code) => {
        try {
            const canvas = document.createElement("canvas")
            JsBarcode(canvas, code, {
                format: "CODE128",
                width: 2,
                height: 100,
                displayValue: true,
            })
            setBarcode(canvas.toDataURL("image/png"))
        } catch (error) {
            console.error("Error generating barcode:", error)
            toast.error("Failed to generate barcode")
        }
    }

    const downloadBarcode = () => {
        if (!barcode) return

        const link = document.createElement("a")
        link.to = barcode
        link.download = `barcode-${book._id}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success("Barcode downloaded successfully")
    }

    const copyBarcodeToClipboard = () => {
        if (!barcode) return

        fetch(barcode)
            .then((res) => res.blob())
            .then((blob) => {
                navigator.clipboard.write([
                    new ClipboardItem({
                        "image/png": blob,
                    }),
                ])
                toast.success("Barcode copied to clipboard")
            })
            .catch(() => {
                toast.error("Failed to copy barcode")
            })
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading book details...</p>
                </div>
            </div>
        )
    }

    if (!book) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    <Link
                        to="/admin/shelf"
                        className="inline-flex items-center gap-2 px-4 py-2 text-teal-600 hover:text-teal-700 font-medium mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Search
                    </Link>
                    <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
                        <GiBookmarklet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-slate-600 mb-2">Book Not Found</h2>
                        <p className="text-slate-500">The book you're looking for doesn't exist or has been removed.</p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header Section */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    <Link
                        to="/admin/shelf"
                        className="inline-flex items-center gap-2 px-4 py-2 text-teal-600 hover:text-teal-700 font-medium mb-6 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Search
                    </Link>

                    <div className="flex items-start gap-4">
                        <div className="bg-teal-100 rounded-full p-3">
                            <GiBookmarklet className="w-8 h-8 text-teal-700" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 line-clamp-2">{book.title}</h1>
                            <p className="text-lg text-slate-600 mt-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-teal-600" />
                                {book.author}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Book Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Information */}
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-teal-50 to-teal-100/50 p-4 border-b border-slate-200">
                                <h2 className="text-lg font-bold text-slate-900">Book Information</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* ISBN */}
                                <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                                    <Barcode className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-600 font-medium mb-1">ISBN</p>
                                        <p className="text-base font-mono text-slate-900 break-all">{book.isbn}</p>
                                    </div>
                                </div>

                                {/* Publisher */}
                                <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                                    <Book className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-600 font-medium mb-1">Publisher</p>
                                        <p className="text-base text-slate-900">{book.publisher || "N/A"}</p>
                                    </div>
                                </div>

                                {/* Publication Year */}
                                <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                                    <Clock className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-600 font-medium mb-1">Publication Year</p>
                                        <p className="text-base text-slate-900">{book.publicationYear || "N/A"}</p>
                                    </div>
                                </div>

                                {/* Category/Genre */}
                                <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                                    <FileText className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-600 font-medium mb-1">Genre</p>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="inline-block px-3 py-1 bg-teal-100 text-teal-700 text-sm rounded-full font-medium">
                                                {book.genre || "General"}
                                            </span>
                                            {book.category && (
                                                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full font-medium">
                                                    {book.category}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Availability */}
                                <div className="flex items-start gap-4">
                                    <Package className="w-5 h-5 text-teal-600 flex-shrink-0 mt-1" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-slate-600 font-medium mb-1">Availability</p>
                                        <p className="text-base font-semibold text-slate-900">
                                            {book.availableCopies} of {book.totalCopies} copies available
                                        </p>
                                        <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                                            <div
                                                className="bg-teal-600 h-2 rounded-full transition-all"
                                                style={{
                                                    width: `${(book.availableCopies / book.totalCopies) * 100}%`,
                                                }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {book.description && (
                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-teal-50 to-teal-100/50 p-4 border-b border-slate-200">
                                    <h2 className="text-lg font-bold text-slate-900">Description</h2>
                                </div>
                                <div className="p-6">
                                    <p className="text-slate-700 leading-relaxed">{book.description}</p>
                                </div>
                            </div>
                        )}

                        {/* Additional Details */}
                        {(book.section || book.location) && (
                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-teal-50 to-teal-100/50 p-4 border-b border-slate-200">
                                    <h2 className="text-lg font-bold text-slate-900">Library Details</h2>
                                </div>
                                <div className="p-6 grid grid-cols-2 gap-4">
                                    {book.section && (
                                        <div>
                                            <p className="text-sm text-slate-600 font-medium mb-1">Section</p>
                                            <p className="text-base text-slate-900">{book.section}</p>
                                        </div>
                                    )}
                                    {book.location && (
                                        <div>
                                            <p className="text-sm text-slate-600 font-medium mb-1">Location</p>
                                            <p className="text-base text-slate-900">{book.location}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Barcode */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden sticky top-6">
                            <div className="bg-gradient-to-r from-teal-50 to-teal-100/50 p-4 border-b border-slate-200">
                                <h2 className="text-lg font-bold text-slate-900">Book Barcode</h2>
                            </div>

                            <div className="p-6 space-y-4">
                                {/* Barcode Display */}
                                {barcode && (
                                    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg p-4 border border-slate-200">
                                        <img
                                            ref={barcodeRef}
                                            src={barcode || "/placeholder.svg"}
                                            alt="Book Barcode"
                                            className="max-w-full h-auto"
                                        />
                                    </div>
                                )}

                                {/* Book ID */}
                                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200">
                                    <p className="text-xs text-slate-600 font-medium mb-1">Book ID</p>
                                    <p className="text-sm font-mono text-slate-900 break-all">{book._id}</p>
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2">
                                    <button
                                        onClick={downloadBarcode}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        Download Barcode
                                    </button>

                                    <button
                                        onClick={copyBarcodeToClipboard}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium rounded-lg transition-colors"
                                    >
                                        <Copy className="w-4 h-4" />
                                        Copy Barcode
                                    </button>
                                </div>

                                {/* Info */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-xs text-blue-700">
                                        <span className="font-semibold">Barcode Format:</span> CODE128
                                    </p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        <span className="font-semibold">Generated from:</span> Book ID
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
