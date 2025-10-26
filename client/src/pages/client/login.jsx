"use client"

import React, { useState, useEffect } from "react"
import { BookOpen } from "lucide-react"
import { GiBookmarklet } from "react-icons/gi"
import { useLibrary } from "../../store/libaray-session"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export default function Login() {
    const [prn, setPrn] = useState("")
    const [mounted, setMounted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const { isLoggedIn, student, checkLoginStatus } = useLibrary()
    const navigate = useNavigate()

    useEffect(() => {
        if (isLoggedIn) {
            navigate("/")
            return;
        }
        setMounted(true)
    }, [])

    const handleLogin = async () => {
        if (!prn.trim()) return toast.error("Please enter your PRN")

        setIsLoading(true)
        try {
            const active = await checkLoginStatus(prn) // <-- get status immediately

            if (active) {
                toast.success(`Welcome back, ${student?.name || "Student"}!`)
                navigate("/")
            } else {
                toast.info("No entry found today. Please scan your RFID card.")
                navigate("/scan-rfid")
            }
        } catch (error) {
            console.error(error)
            toast.error("Unable to check login. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left side - Branding Panel */}
            <div className="w-full lg:w-1/2 bg-gradient-to-br from-teal-600 via-teal-500 to-teal-700 relative overflow-hidden min-h-[50vh] lg:min-h-screen">
                <div
                    className={`absolute inset-0 flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12 transition-opacity duration-1000 ${mounted ? "opacity-100" : "opacity-0"
                        }`}
                >
                    <div className="relative mb-8">
                        <div className="w-28 h-28 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/20 shadow-2xl">
                            <GiBookmarklet className="w-14 h-14 text-white" />
                        </div>
                        <div className="absolute -top-3 -right-3 w-10 h-10 bg-teal-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <div className="text-center mb-8">
                        <div className="border-4 border-teal-200 text-white text-3xl font-bold rounded-2xl flex flex-row shadow-2xl">
                            <div className="bg-teal-700 py-1 px-2 rounded-l-md">DIGITAL</div>
                            <div className="text-teal-100 py-1 px-2">LIBRARY-TWIN</div>
                        </div>
                        <p className="text-white/90 text-sm mt-4">Access your library account with your PRN</p>
                    </div>
                </div>
            </div>

            {/* Right side - Login Form */}
            <div
                className={`w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-slate-50 to-slate-100 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
            >
                <div className="w-full max-w-md">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <BookOpen className="w-6 h-6 text-teal-600" /> Student{" "}
                        <span className="text-teal-600">Login</span>
                    </h1>
                    <p className="text-slate-600 mb-8">Enter your PRN to access the digital library</p>

                    <form className="space-y-6 sm:space-y-8" onSubmit={(e) => e.preventDefault()}>
                        <div className="space-y-2">
                            <label htmlFor="prn" className="text-sm font-medium text-slate-700 block">
                                PRN (Personal Registration Number)
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
                                    <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
                                </div>
                                <input
                                    id="prn"
                                    name="prn"
                                    type="text"
                                    required
                                    value={prn}
                                    onChange={(e) => setPrn(e.target.value)}
                                    className="block w-full pl-10 sm:pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 text-base transition-all duration-200"
                                    placeholder="Enter your PRN"
                                />
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                Your PRN is a unique identifier provided by the library
                            </p>
                        </div>

                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={handleLogin}
                            className="w-full flex items-center justify-center px-6 py-3 rounded-xl text-base font-medium text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 disabled:from-slate-400 disabled:to-slate-500 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                    Logging in...
                                </>
                            ) : (
                                "Login to Library"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}
