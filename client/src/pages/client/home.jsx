"use client"

import { BookOpen, Users, Award, Clock, Heart, Zap, User } from "lucide-react"
import { GiBookmarklet } from "react-icons/gi"
import { useStudentSession } from "../../store/student-session"
import { Link, useNavigate } from "react-router-dom"
import { useLibrary } from "../../store/libaray-session"

export default function ClientLanding() {
    const { student, isLoggedIn, logout } = useLibrary();
    const navigate = useNavigate();
    if (!isLoggedIn) {
        navigate("/login");
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
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

            {/* Hero Section */}
            <div className="bg-gradient-to-r from-teal-50 to-teal-100/50 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
                    <div className="max-w-2xl">
                        <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Welcome to Your Digital Library</h2>
                        <p className="text-lg text-slate-600 mb-8">
                            Explore thousands of books, manage your borrowings, and discover your next favorite read.
                        </p>
                        <div className="flex gap-4">
                            <Link to={'/search'}>
                                <button className="px-8 cursor-pointer py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors">
                                    Browse Books
                                </button>
                            </Link>
                            <Link to={'/my-request'}>
                                <button className="px-8 cursor-pointer py-3 bg-white border-2 border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold rounded-lg transition-colors">
                                    My Requests
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* About Library Section */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
                <div className="mb-12">
                    <h3 className="text-3xl font-bold text-slate-900 mb-4">About Our Library</h3>
                    <p className="text-slate-600 text-lg leading-relaxed mb-8">
                        Our Digital Library is a comprehensive collection of educational and recreational books designed to support
                        student learning and foster a love of reading. With thousands of titles across multiple genres and subjects,
                        we provide easy access to knowledge and entertainment.
                    </p>
                </div>

                {/* Library Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Total Books</p>
                                <p className="text-2xl font-bold text-slate-900">30</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                                <Users className="w-6 h-6 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Active Users</p>
                                <p className="text-2xl font-bold text-slate-900">1</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                                <Award className="w-6 h-6 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Categories</p>
                                <p className="text-2xl font-bold text-slate-900">6</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                                <Clock className="w-6 h-6 text-teal-600" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-600">Borrow Period</p>
                                <p className="text-2xl font-bold text-slate-900">2</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                            <Zap className="w-6 h-6 text-teal-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">Quick Search</h4>
                        <p className="text-slate-600">
                            Find books instantly by title, author, ISBN, or category with our powerful search engine.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                            <Heart className="w-6 h-6 text-teal-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">Personalized Lists</h4>
                        <p className="text-slate-600">
                            Create and manage your reading lists, wishlist, and track books you've already read.
                        </p>
                    </div>

                    <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
                        <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                            <BookOpen className="w-6 h-6 text-teal-600" />
                        </div>
                        <h4 className="text-lg font-semibold text-slate-900 mb-2">Easy Borrowing</h4>
                        <p className="text-slate-600">
                            Request books with one click and get notifications when they're ready for pickup.
                        </p>
                    </div>
                </div>
            </div>

            {/* Student Info Section */}
            <div className="bg-gradient-to-r from-teal-50 to-teal-100/50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
                    <h3 className="text-3xl font-bold text-slate-900 mb-8">Your Profile</h3>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Student Card */}
                        <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                            <div className="bg-gradient-to-r from-teal-500 to-teal-600 p-6 text-white">
                                <h4 className="text-2xl font-bold mb-2">{student.name}</h4>
                                <p className="text-teal-100">PRN: {student.prn}</p>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-slate-600 font-medium">Class</p>
                                        <p className="text-lg font-semibold text-slate-900">{student.class}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 font-medium">Section</p>
                                        <p className="text-lg font-semibold text-slate-900">{student.section}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 font-medium">Roll No</p>
                                        <p className="text-lg font-semibold text-slate-900">{student.rollNo}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-600 font-medium">Email</p>
                                        <p className="text-lg font-semibold text-slate-900">{student.email}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Credits & Stats Card */}
                        <div className="space-y-4">
                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-sm text-slate-600 font-medium">Available Credits</p>
                                    <span className="text-3xl font-bold text-teal-600">{student.credits}</span>
                                </div>
                                <p className="text-xs text-slate-500">Use credits to borrow books</p>
                            </div>

                            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                                <p className="text-sm text-slate-600 font-medium mb-3">Quick Stats</p>
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Currently Borrowed</span>
                                        <span className="font-semibold text-slate-900">{student.borrowedBooks}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-slate-600">Total Read</span>
                                        <span className="font-semibold text-slate-900">{student.totalBooksRead}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-900 text-white border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                        <div>
                            <h5 className="font-semibold mb-4">About</h5>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li>
                                    <a href="#" className="hover:text-white transition">
                                        About Library
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition">
                                        Contact Us
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-semibold mb-4">Services</h5>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li>
                                    <a href="#" className="hover:text-white transition">
                                        Browse Books
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition">
                                        My Requests
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-semibold mb-4">Support</h5>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li>
                                    <a href="#" className="hover:text-white transition">
                                        FAQ
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition">
                                        Help Center
                                    </a>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h5 className="font-semibold mb-4">Legal</h5>
                            <ul className="space-y-2 text-sm text-slate-400">
                                <li>
                                    <a href="#" className="hover:text-white transition">
                                        Privacy Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="hover:text-white transition">
                                        Terms of Service
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
                        <p>&copy; 2025 Digital Library. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
