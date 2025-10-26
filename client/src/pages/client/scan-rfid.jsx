"use client"

import { useState, useEffect } from "react"
import { Wifi, BookOpen, Zap } from "lucide-react"
import { GiBookmarklet } from "react-icons/gi"
import { BiRfid } from "react-icons/bi"

export default function ScanRFID() {
    const [mounted, setMounted] = useState(false)
    const [isScanning, setIsScanning] = useState(false)
    const [scanProgress, setScanProgress] = useState(0)

    useEffect(() => {
        setMounted(true)
    }, [])

    useEffect(() => {
        if (!isScanning) return

        const interval = setInterval(() => {
            setScanProgress((prev) => {
                if (prev >= 100) {
                    setIsScanning(false)
                    return 0
                }
                return prev + 10
            })
        }, 300)

        return () => clearInterval(interval)
    }, [isScanning])

    const handleStartScan = () => {
        setIsScanning(true)
        setScanProgress(0)
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
                            <Wifi className="w-5 h-5 text-white" />
                        </div>
                    </div>

                    <div className="text-center">
                        <div className="border-4 border-teal-200 text-white text-3xl font-bold rounded-2xl flex flex-row shadow-2xl">
                            <div className="bg-teal-700 py-1 px-2 rounded-l-md">DIGITAL</div>
                            <div className="text-teal-100 py-1 px-2">LIBRARY-TWIN</div>
                        </div>
                        <p className="text-white/90 text-sm mt-4">Smart RFID Book Issuance System</p>
                    </div>

                    <div className="space-y-4 mt-12 max-w-xs">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-1">
                                <Zap className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">Fast Issuance</p>
                                <p className="text-white/80 text-xs">Scan and get books instantly</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-1">
                                <BookOpen className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-white font-semibold text-sm">Easy Access</p>
                                <p className="text-white/80 text-xs">No manual paperwork needed</p>
                            </div>
                        </div>
                        {/* Instructions */}
                        <div className=" p-4 rounded-lg">
                            <h3 className="font-semibold text-white mb-2 text-md flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-white" />
                                How to Issue Books
                            </h3>
                            <ol className="text-sm font-semibold text-white space-y-1 list-decimal list-inside">
                                <li>Place your RFID card at the desk scanner</li>
                                <li>Wait for the scan to complete</li>
                                <li>Your books will be issued automatically</li>
                            </ol>
                        </div>

                    </div>
                </div>
            </div>

            {/* Right side - RFID Scan Interface */}
            <div
                className={`w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-br from-slate-50 to-slate-100 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                    }`}
            >
                <div className="w-full max-w-md">
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Wifi className="w-6 h-6 text-teal-600" /> RFID <span className="text-teal-600">Scan</span>
                    </h1>
                    <p className="text-slate-600 mb-8">Place your RFID card at the desk scanner to issue books</p>

                    <div className="space-y-8">
                        {/* Scanning Area */}
                        <div className="relative">
                            <div
                                className={`relative w-full aspect-square rounded-2xl border-4 border-dashed transition-all duration-300 flex items-center justify-center overflow-hidden ${isScanning ? "border-teal-600 bg-teal-50" : "border-slate-300 bg-slate-50 hover:border-teal-400"
                                    }`}
                            >
                                {/* Animated scanning waves */}
                                {isScanning && (
                                    <>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="absolute w-24 h-24 rounded-full border-2 border-teal-400 animate-pulse"></div>
                                            <div
                                                className="absolute w-32 h-32 rounded-full border-2 border-teal-300 animate-pulse"
                                                style={{ animationDelay: "0.2s" }}
                                            ></div>
                                            <div
                                                className="absolute w-40 h-40 rounded-full border-2 border-teal-200 animate-pulse"
                                                style={{ animationDelay: "0.4s" }}
                                            ></div>
                                        </div>
                                    </>
                                )}

                                <div className="relative z-10 text-center">
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
                                </div>
                            </div>

                            {/* Progress bar */}
                            {isScanning && (
                                <div className="mt-4 w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-teal-600 to-teal-500 h-full transition-all duration-300"
                                        style={{ width: `${scanProgress}%` }}
                                    ></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
