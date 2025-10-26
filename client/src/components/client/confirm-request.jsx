"use client"

import { useMemo, useState } from "react"
import { User, CalendarDays, CheckCircle2, AlertCircle, BookOpen, BadgeMinus } from "lucide-react"
import { GiBookmarklet } from "react-icons/gi"
import { toast } from "sonner"


export default function ConfirmBorrow({ book, user, defaultExpectedDate, onConfirm, onCancel, disabled }) {
    // local state
    const [longTerm, setLongTerm] = useState(false)
    const [expectedDate, setExpectedDate] = useState(defaultExpectedDate || "")
    const [creditsLeft, setCreditsLeft] = useState(user?.credits ?? 0)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)


    // compute today's date for min attr
    const todayISO = useMemo(() => {
        const d = new Date()
        const yyyy = d.getFullYear()
        const mm = String(d.getMonth() + 1).padStart(2, "0")
        const dd = String(d.getDate()).padStart(2, "0")
        return `${yyyy}-${mm}-${dd}`
    }, [])

    const confirmDisabled =
        disabled ||
        isSubmitting ||
        creditsLeft < 1 ||
        (!!book?.availableCopies && !!book?.totalCopies && book.availableCopies <= 0) ||
        (!longTerm && expectedDate.trim() === "")

    const handleConfirm = async () => {
        console.log("Confirming borrow request..." ,user)
        setError(null)
        setSuccess(null)

        if (creditsLeft < 1) {
            setError("Insufficient credits to borrow this book.")
            return
        }
        if (!longTerm && expectedDate.trim() === "") {
            setError("Please select an expected return date.")
            return
        }

        const payload = {
            userId: user?._id,
            bookId: book?.id || book?._id,
            expectedReturnDate: longTerm ? null : expectedDate,
            longTermBorrow: longTerm,
            creditUsed: 1,
        }

        try {
            setIsSubmitting(true)

            // Call backend API
            const API = import.meta.env.VITE_API_URL
            const res = await fetch(`${API}/issue/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            })

            if (!res.ok) {
                const errData = await res.json()
                toast.error(errData.message || "Failed to create borrow request.")
            }

            const data = await res.json()
            setCreditsLeft((c) => Math.max(0, c - 1))
            toast.success("Borrow confirmed! One credit has been used.")

            // Optional: callback for parent to refresh list or UI
            onConfirm?.(data)
        } catch (e) {
            setError(e.message || "Something went wrong while confirming.")
        } finally {
            setIsSubmitting(false)
        }
    }


    return (
        <div className="min-h-screen min-w-3xl bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-teal-600 rounded-full w-11 h-11 flex items-center justify-center">
                            <GiBookmarklet className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Confirm Book Request</h1>
                            <p className="text-slate-600 text-sm">Review details, set return date, and confirm using one credit.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Card */}
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-8">
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    {/* Card header */}
                    <div className="bg-gradient-to-r from-teal-50 to-teal-100/60 px-5 py-4 border-b border-slate-200 flex items-start gap-3">
                        <div className="bg-teal-500 rounded-lg p-2">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-slate-900">{book?.title || "Book"}</h2>
                            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                                {book?.author && (
                                    <div className="flex items-center gap-2 text-slate-700">
                                        <User className="w-4 h-4 text-teal-600" />
                                        <span className="font-medium">{book.author}</span>
                                    </div>
                                )}
                                {book?.isbn && (
                                    <div className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs border border-slate-200">
                                        ISBN: {book.isbn}
                                    </div>
                                )}
                                {typeof book?.availableCopies === "number" && typeof book?.totalCopies === "number" && (
                                    <div className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs border border-slate-200">
                                        {book.availableCopies} of {book.totalCopies} copies available
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Card body */}
                    <div className="p-5 space-y-6">
                        {/* User details */}
                        <section className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <User className="w-4 h-4 text-teal-600" />
                                <h3 className="text-slate-900 font-semibold">Your details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-slate-500">Name</p>
                                    <p className="text-slate-900 font-medium">{user?.name || "Unknown"}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">Email</p>
                                    <p className="text-slate-900 font-medium">{user?.email || "—"}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50">
                                        <BadgeMinus className="w-4 h-4 text-teal-600" />
                                        <span className="text-slate-900 font-medium">
                                            Credits remaining: <span className="text-teal-700">{creditsLeft}</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Borrow options */}
                        <section className="border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <CalendarDays className="w-4 h-4 text-teal-600" />
                                <h3 className="text-slate-900 font-semibold">Borrow options</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-slate-600 mb-1" htmlFor="expectedDate">
                                            Expected return date
                                        </label>
                                        <input
                                            id="expectedDate"
                                            type="date"
                                            min={todayISO}
                                            value={expectedDate}
                                            onChange={(e) => setExpectedDate(e.target.value)}
                                            disabled={longTerm}
                                            className="w-full px-3 py-2 rounded-lg border-2 border-slate-200 text-slate-900 placeholder:text-slate-500 bg-white focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-100 disabled:text-slate-500"
                                        />
                                        {!longTerm && (
                                            <p className="text-xs text-slate-500 mt-1">Select a date when you plan to return this book.</p>
                                        )}
                                    </div>

                                    <div className="flex items-start md:items-center gap-3">
                                        <input
                                            id="longTerm"
                                            type="checkbox"
                                            checked={longTerm}
                                            onChange={(e) => setLongTerm(e.target.checked)}
                                            className="mt-1 md:mt-0 w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                                        />
                                        <label htmlFor="longTerm" className="text-sm text-slate-800">
                                            Long-term borrow (no return date)
                                            <span className="block text-xs text-slate-500">
                                                Checking this will disable the expected return date.
                                            </span>
                                        </label>
                                    </div>
                                </div>

                                <div className="text-xs text-slate-600">
                                    • Confirming will use 1 credit. • You must have at least 1 credit to proceed.
                                </div>
                            </div>
                        </section>

                        {/* Alerts */}
                        {error && (
                            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}
                        {success && (
                            <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5" />
                                <p className="text-sm text-green-700">{success}</p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-2">
                            {onCancel && (
                                <button
                                    type="button"
                                    onClick={onCancel}
                                    className="px-4 py-2 cursor-pointer rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors text-sm"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={confirmDisabled}
                                className={`px-4 py-2 rounded-lg cursor-pointer text-white text-sm font-medium transition-colors ${confirmDisabled ? "bg-teal-300 cursor-not-allowed" : "bg-teal-600 hover:bg-teal-700"
                                    }`}
                            >
                                {isSubmitting ? "Confirming..." : "Confirm Borrow (uses 1 credit)"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
