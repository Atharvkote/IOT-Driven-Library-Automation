"use client"

import { useState, useEffect } from "react"
import { Search, User, Barcode, Package, Clock, X, Eye } from "lucide-react"
import { useSocket } from "../../store/socket-context"
import { GiBookmarklet } from "react-icons/gi"
import { IoIosBook } from "react-icons/io"
import {Link} from "react-router-dom"

export default function BookBarcode() {
  const socket = useSocket()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [isSelected, setIsSelected] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [user, setUser] = useState({})

  useEffect(() => {
    if (!socket) return

    const handleResults = (books, user) => {
      setResults(books)
      setUser(user)
        // console.log("bok:" , books , user)
      setIsLoading(false)
    }

    socket.on("searchResults", handleResults)

    return () => {
      socket.off("searchResults", handleResults)
    }
  }, [socket])

  const handleSearch = (value) => {
    setQuery(value)
    setHasSearched(true)

    if (value.trim()) {
      setIsLoading(true)
      socket.emit("searchBooks", value)
    } else {
      setResults([])
    }
  }

  
  const getAvailabilityStatus = (available, total) => {
    if (available === 0) return { status: "Out of Stock", color: "bg-red-50 text-red-700 border-red-200" }
    if (available < total * 0.3) return { status: "Low Stock", color: "bg-amber-50 text-amber-700 border-amber-200" }
    return { status: "Available", color: "bg-green-50 text-green-700 border-green-200" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <GiBookmarklet className="w-12 h-12 text-teal-700" />
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Digital Book Shelf</h1>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by title, author, or ISBN..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-slate-200 text-slate-900 placeholder:text-slate-500 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all text-base"
            />
          </div>

          {/* Search Info */}
          {hasSearched && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-teal-600 rounded-full animate-pulse" />
                    Searching...
                  </span>
                ) : (
                  <span>
                    Found <span className="font-semibold text-teal-700">{results?.length}</span> book
                    {results?.length !== 1 ? "s" : ""}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {!hasSearched ? (
          <div className="text-center py-16 flex flex-col items-center">
            <div className="w-20 h-20 relative bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <div className="absolute w-16 h-16 animate-ping bg-teal-100 rounded-full"></div>
              <IoIosBook className="w-12 h-12 text-teal-600" />
            </div>
            <h2 className="text-xl font-semibold text-slate-600 mb-2">Start Searching</h2>
            <p className="text-slate-500">Enter a book title, author name, or ISBN to find available books</p>
          </div>
        ) : results?.length === 0 && !isLoading ? (
          <div className="text-center py-16 flex flex-col items-center">
            <div className="w-20 h-20 relative bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <div className="absolute w-16 h-16 animate-ping bg-teal-100 rounded-full"></div>
              <Search className="w-12 h-12 text-teal-600" />
            </div>
            <h2 className="text-xl  text-black font-semibold mb-2">Access the library with ease</h2>
            <p className="text-slate-500">Try searching with different keywords</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results?.map((book) => {
              const { status, color } = getAvailabilityStatus(book?.available, book?.total)
              return (
                <div
                  key={book._id}
                  className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r flex gap-3 items-center from-teal-50 to-teal-100/50 p-4 border-b border-slate-200">
                    <div className="bg-teal-500 rounded-full flex justify-center items-center p-2 flex-[0.10]">
                      <GiBookmarklet className="w-7 h-7 text-white" />
                    </div>
                    <div className="flex flex-[0.90] items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 line-clamp-2 group-hover:text-teal-700 transition-colors">
                          {book?.title}
                        </h3>
                        <div className="flex items-center gap-1 mt-2 text-slate-600">
                          <User className="w-4 h-4 text-teal-600" />
                          <p className="text-sm font-medium">{book?.author}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full border text-xs font-semibold whitespace-nowrap ${color}`}>
                        {status}
                      </div>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* ISBN */}
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <Barcode className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">ISBN</p>
                        <p className="text-sm font-mono text-slate-700">{book.isbn}</p>
                      </div>
                    </div>

                    {/* Availability */}
                    <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                      <Package className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Availability</p>
                        <p className="text-sm font-semibold text-slate-900">
                          {book?.availableCopies} of {book?.totalCopies} copies
                        </p>
                      </div>
                    </div>

                    {/* Category & Year */}
                    <div className="grid grid-cols-2 gap-3">
                      {book?.category && (
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">Category</p>
                          <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded font-medium">
                            {book?.category}
                          </span>
                        </div>
                      )}
                      {book?.publishedYear && (
                        <div>
                          <p className="text-xs text-slate-500 font-medium mb-1">Published</p>
                          <div className="flex items-center gap-1 text-slate-700">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs font-medium">{book?.publishedYear}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {book?.description && (
                      <div className="pt-2">
                        <p className="text-xs text-slate-600 line-clamp-2">{book?.description}</p>
                      </div>
                    )}

                    {/* Publisher */}
                    {book?.publisher && (
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-xs text-slate-500">
                          <span className="font-medium">Publisher:</span> {book?.publisher}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 space-y-2">
                    <Link to={`/admin/book-details/${book._id}`} className="block">
                      <button className="w-full cursor-pointer px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 font-medium rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        View Details & Barcode
                      </button>
                    </Link>
                    {/* <button
                      onClick={() => handleRequestBook(book)}
                      className="w-full cursor-pointer px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={book?.availableCopies <= 0}
                    >
                      {book?.availableCopies > 0 ? "Request Book" : "Notify Me"}
                    </button> */}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

     
    </div>
  )
}
