"use client"

import { useState, useEffect } from "react"
import { User, Mail, BookOpen, Calendar, Award, ArrowLeft } from "lucide-react"
import { useNavigate, useSearchParams, Link } from "react-router-dom"
import { toast } from "sonner"
import { useLibrary } from "../../store/libaray-session"
import { GiBookmarklet } from "react-icons/gi"

export default function ProfilePage() {
    const router = useNavigate()
    const [searchParams] = useSearchParams()
    const [isLoading, setIsLoading] = useState(false)
    const [borrowedBooks, setBorrowedBooks] = useState([])
    const { student, isLoggedIn, logout } = useLibrary();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 rounded-full border-4 border-teal-200 border-t-teal-600 animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-semibold">Loading profile...</p>
                </div>
            </div>
        )
    }

    if (!student) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600 font-semibold mb-4">Student profile not found</p>
                    <button
                        onClick={() => router("/")}
                        className="px-6 py-2 cursor-pointer bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-semibold"
                    >
                        Back to Verify
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-slate-100 ">
            <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50 ">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <GiBookmarklet className="w-10 h-10 text-teal-600" />
                        <h1 className="text-2xl font-bold text-slate-900">Digital Library</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {isLoggedIn ? <button onClick={logout} className="px-6 py-2 cursor-pointer bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors">
                            Sign Out
                        </button> :
                            <Link to={"/login"}>
                                <button className="px-6 py-2 cursor-pointer bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors">
                                    Sign In
                                </button>
                            </Link>
                        }
                        {isLoggedIn && <Link to={'/profile'}><button className="px-6 cursor-pointer flex items-center gap-1 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors">
                            <User className=" text-white" />  Profile
                        </button></Link>}

                    </div>

                </div>
            </div>
            <div className="max-w-4xl mt-10 mx-auto">
                {/* Header with Back Button */}
                <div className="flex items-center justify-between mb-8">
                    <button
                        onClick={() => router("/")}
                        className="flex cursor-pointer items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Verify
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900">Student Profile</h1>
                    <div className="w-20"></div>
                </div>

                {/* Profile Header Card */}
                <div className="bg-gradient-to-r from-teal-600 to-cyan-600 rounded-2xl shadow-xl p-8 text-white mb-8">
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-6">
                            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center border-4 border-white/30">
                                <User className="w-12 h-12 text-white" />
                            </div>
                            <div>
                                <h2 className="text-4xl font-bold mb-2">{student?.name || "N/A"}</h2>
                                <p className="text-white/80 text-lg">PRN: {student?.prn_number || "N/A"}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <User className="w-5 h-5 text-teal-600" />
                            Basic Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-slate-600 font-semibold mb-1">Full Name</p>
                                <p className="text-lg text-slate-900 font-semibold">{student?.name || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 font-semibold mb-1">PRN Number</p>
                                <p className="text-lg text-teal-700 font-mono font-bold">{student?.prn_number || "N/A"}</p>
                            </div>
                            <div>
                                <p className="text-sm text-slate-600 font-semibold mb-1">Class</p>
                                <p className="text-lg text-slate-900 font-semibold">{student?.class || "N/A"}</p>
                            </div>
                            {student?.email && (
                                <div>
                                    <p className="text-sm text-slate-600 font-semibold mb-1">Email</p>
                                    <p className="text-lg text-slate-900 font-semibold flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-teal-600" />
                                        {student.email}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Statistics Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <Award className="w-5 h-5 text-teal-600" />
                            Library Statistics
                        </h3>
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-200">
                                <p className="text-sm text-slate-600 font-semibold mb-1">Books Borrowed</p>
                                <p className="text-3xl font-bold text-teal-600">{6 - student.credits || 0}</p>
                            </div>
                            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-200">
                                <p className="text-sm text-slate-600 font-semibold mb-1">Active Borrowings</p>
                                <p className="text-3xl font-bold text-amber-600">
                                    {borrowedBooks?.filter((b) => !b.returnDate)?.length || 0}
                                </p>
                            </div>
                            {student?.memberSince && (
                                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
                                    <p className="text-sm text-slate-600 font-semibold mb-1">Member Since</p>
                                    <p className="text-lg text-purple-600 font-semibold flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {new Date(student.memberSince).toLocaleDateString()}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Borrowed Books Section */}
                {borrowedBooks && borrowedBooks.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                        <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-teal-600" />
                            Borrowed Books ({borrowedBooks.length})
                        </h3>
                        <div className="space-y-4">
                            {borrowedBooks.map((book, index) => (
                                <div key={index} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-semibold text-slate-900">{book?.title || "N/A"}</p>
                                            <p className="text-sm text-slate-600">{book?.author || "Unknown Author"}</p>
                                        </div>
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${book?.returnDate ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                                                }`}
                                        >
                                            {book?.returnDate ? "Returned" : "Active"}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-600">Borrowed Date</p>
                                            <p className="font-semibold text-slate-900">
                                                {book?.borrowDate ? new Date(book.borrowDate).toLocaleDateString() : "N/A"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-slate-600">Due Date</p>
                                            <p className="font-semibold text-slate-900">
                                                {book?.dueDate ? new Date(book.dueDate).toLocaleDateString() : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State for Borrowed Books */}
                {(!borrowedBooks || borrowedBooks.length === 0) && (
                    <div className="bg-white rounded-2xl shadow-lg p-12 border border-slate-200 text-center">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-600 font-semibold">No borrowed books at the moment</p>
                    </div>
                )}
            </div>
        </div>
    )
}
