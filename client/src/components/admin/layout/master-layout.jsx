"use client"

import React from "react"
import { useMemo, useState, useEffect } from "react"
import { Link, useLocation, Outlet } from "react-router-dom"
import { GiBookmarklet, GiBookStorm } from "react-icons/gi";
import { GoGitCompare } from "react-icons/go";
import {
  Users,
  Package,
  Settings,
  LogOut,
  Menu,
  Shield,
  BarChart3,
  FileText,
  Lock,
  Package2,
  AlertTriangle,
  Building2,
  ChevronDown,
  ChevronRight,
  Search,
  X,
  Wifi,
} from "lucide-react"
import { PiTractorFill } from "react-icons/pi"
import { FaUserCog, FaHome, FaCheck, FaCheckCircle, FaRupeeSign } from "react-icons/fa"
import { MdDashboard } from "react-icons/md"
import { Clock, Key, GitCompare, Heart } from "lucide-react"
import { MdDocumentScanner } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";

export function MasterLayout() {
  const pathname = useLocation().pathname
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isInventoryOpen, setIsInventoryOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
    }
    onResize()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [])

  const navigation = useMemo(
    () => [
      { name: "Home", href: "/admin", icon: FaHome, current: pathname === "/admin" },
      {
        name: "RFID Authenticator",
        href: "/admin/scan",
        icon: MdDocumentScanner,
        current: pathname === "/admin/scan",
      },
      {
        name: "Digital Book Self",
        href: "/admin/shelf",
        icon: GiBookmarklet,
        current: pathname === "/admin/shelf",
      },
      {
        name: "Manage Request",
        href: "/admin/requests",
        icon: GoGitCompare,
        current: pathname === "/admin/requests",
      },
      {
        name: "Live Library",
        href: "/admin/twins",
        icon: Wifi,
        current: pathname === "/admin/twins",
      },
      {
        name: "Issue Verfication",
        href: "/admin/verify",
        icon: FaCheckCircle,
        current: pathname === "/admin/verify",
      },
      {
        name: "Fine Management",
        href: "/admin/fines",
        icon: FaRupeeSign,
        current: pathname === "/admin/fines",
      },

      {
        name: "Management",
        icon: IoMdSettings,
        isDropdown: true,
        isOpen: isInventoryOpen,
        onToggle: () => setIsInventoryOpen((s) => !s),
        children: [
          {
            name: "CRUD : Books",
            href: "/dashboard/inventory/spare-parts",
            icon: GiBookmarklet,
            current: pathname === "/dashboard/inventory/spare-parts",
          },
          {
            name: "CRUD : Students",
            href: "/dashboard/inventory/low-stock",
            icon: Users,
            current: pathname === "/dashboard/inventory/low-stock",
            // badge: "3",
          },
          {
            name: "CRUD : Sections",
            href: "/dashboard/inventory/suppliers",
            icon: MdDashboard,
            current: pathname === "/dashboard/inventory/suppliers",
          },
        ],
      },
    ],
    [pathname, isInventoryOpen],
  )

  useEffect(() => {
    const inv = navigation.find((n) => n.isDropdown)
    if (inv?.children?.some((c) => c.current)) {
      setIsInventoryOpen(true)
    }
  }, [navigation])

  const filteredNav = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return navigation
    return navigation
      .map((item) => {
        if (!item.isDropdown) {
          return item.name.toLowerCase().includes(q) ? item : null
        }
        const matchedChildren = item.children?.filter((c) => c.name.toLowerCase().includes(q)) || []
        if (item.name.toLowerCase().includes(q) || matchedChildren.length > 0) {
          return { ...item, isOpen: true, children: matchedChildren.length ? matchedChildren : item.children }
        }
        return null
      })
      .filter(Boolean)
  }, [navigation, query])

  const currentTop = useMemo(
    () => navigation.find((n) => (n.isDropdown ? n.children?.some((c) => c.current) : n.current)),
    [navigation],
  )

  const currentChild = useMemo(
    () => (currentTop && currentTop.isDropdown ? currentTop.children?.find((c) => c.current) : null),
    [currentTop],
  )

  const handleLogout = () => {
    console.log("Logging out...")
  }

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex relative">
      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white border-r border-slate-200 flex flex-col shadow-lg">
            {/* Mobile Sidebar Header */}
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FaUserCog className="w-8 h-8 text-teal-700" />
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">SCOE LIBRARY</h2>
                    <span className="text-xs text-slate-600 font-semibold">Email: </span>
                    <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded">
                      atharvkote@gmail.com
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-slate-700 hover:bg-slate-100 p-1 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 overflow-y-auto p-2">
              {filteredNav.map((item) => (
                <div key={item.name}>
                  {item.isDropdown ? (
                    <div>
                      <button
                        onClick={item.onToggle}
                        className={`w-full flex items-center justify-between gap-3 p-3 mb-1 rounded-lg transition-all ${item.children?.some((c) => c.current)
                          ? "bg-teal-50 text-slate-900 border border-teal-200"
                          : "hover:bg-slate-100 text-slate-700"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 text-teal-700" />
                          <span className="font-medium text-sm">{item.name}</span>
                        </div>
                        {item.isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </button>
                      {item.isOpen && (
                        <div className="ml-8 mr-2 mb-1">
                          {item.children?.map((child) => (
                            <Link
                              key={child.name}
                              to={child.href || "#"}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={`flex items-center justify-between gap-2 p-2 rounded-md mb-1 transition-all ${child.current
                                ? "bg-teal-50 text-slate-900 border border-teal-200"
                                : "hover:bg-slate-100 text-slate-700"
                                }`}
                            >
                              <div className="flex items-center gap-2">
                                <child.icon className="w-4 h-4 text-teal-700" />
                                <span className="text-sm font-semibold">{child.name}</span>
                              </div>
                              {child.badge && (
                                <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded">
                                  {child.badge}
                                </span>
                              )}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href || "#"}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 p-3 mb-1 rounded-lg transition-all ${item.current ? "bg-teal-400 text-white" : "hover:bg-slate-100 text-slate-700"
                        }`}
                    >
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium text-sm">{item.name}</span>
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex h-full flex-col border-r border-slate-200 bg-white text-slate-800 transition-all duration-300 ${sidebarOpen ? "w-80" : "w-16"
          } shadow-sm`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <FaUserCog className="w-8 h-8 text-teal-700" />
                <div>
                  <h2 className="text-lg font-bold text-slate-900">SCOE LIBRARY</h2>
                  <span className="text-xs text-slate-600 font-semibold">Email: </span>
                  <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded">
                    atharvkote@gmail.com
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen((s) => !s)}
              className="text-slate-700 hover:bg-slate-100 p-1 rounded cursor-pointer"
            >
              {sidebarOpen ? <ChevronRight className="w-4 h-4" /> : <MdDashboard className="w-6 h-6 text-teal-600" />}
            </button>
          </div>
          {sidebarOpen && (
            <div className="mt-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 text-slate-900 placeholder:text-slate-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          )}
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto p-2">
          {filteredNav.map((item) => (
            <div key={item.name}>
              {item.isDropdown ? (
                <div>
                  <button
                    onClick={item.onToggle}
                    className={`w-full flex items-center ${sidebarOpen ? "justify-between" : "justify-center"} gap-3 p-3 mb-1 rounded-lg transition-all ${item.children?.some((c) => c.current)
                      ? "bg-teal-50 text-slate-900 border border-teal-200"
                      : "hover:bg-slate-100 text-slate-700"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5 text-teal-700" />
                      {sidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
                    </div>
                    {sidebarOpen &&
                      (item.isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)}
                  </button>
                  {item.isOpen && (
                    <div
                      className={`overflow-hidden transition-all duration-300 ${sidebarOpen ? "ml-8 mr-2 mb-1" : ""}`}
                    >
                      {item.children?.map((child) => (
                        <Link
                          key={child.name}
                          to={child.href || "#"}
                          className={`flex items-center ${sidebarOpen ? "justify-between" : "justify-center"} gap-2 p-2 rounded-md mb-1 transition-all ${child.current
                            ? "bg-teal-50 text-slate-900 border border-teal-200"
                            : "hover:bg-slate-100 text-slate-700"
                            }`}
                          title={!sidebarOpen ? child.name : undefined}
                        >
                          <div className="flex items-center gap-2">
                            <child.icon className="w-4 h-4 text-teal-700" />
                            {sidebarOpen && <span className="text-sm font-semibold">{child.name}</span>}
                          </div>
                          {sidebarOpen && child.badge && (
                            <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded">
                              {child.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to={item.href || "#"}
                  className={`flex items-center ${sidebarOpen ? "justify-start gap-3" : "justify-center"} p-3 mb-1 rounded-lg transition-all ${item.current ? "bg-teal-400 text-white shadow-lg" : "hover:bg-slate-100 text-slate-700"
                    }`}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <item.icon className="w-5 h-5" />
                  {sidebarOpen && <span className="font-medium text-sm">{item.name}</span>}
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 p-4 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden text-slate-700 hover:bg-slate-100 p-2 rounded cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              {currentTop ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-sm md:text-base font-semibold text-slate-900 flex items-center gap-2">
                    <Link to="/admin" className="text-teal-700 hover:text-teal-800">
                      <FaHome className="w-4 h-4" />
                    </Link>
                    <ChevronRight className="text-slate-500 w-4 h-4" />
                    {currentTop.name}
                  </h1>
                  {currentChild && (
                    <>
                      <ChevronRight className="text-slate-500 w-4 h-4" />
                      <span className="text-sm md:text-base font-semibold text-teal-700">{currentChild.name}</span>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center gap-2">
                    <GiBookmarklet className="w-9 h-9 text-teal-700" />
                    <h1 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">SCOE Library</h1>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-1">
                    <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full flex items-center gap-1.5">
                      <Lock className="w-4 h-4" /> Secured
                    </span>
                    <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full flex items-center gap-1.5">
                      <Shield className="w-4 h-4" /> Verified
                    </span>
                    <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full flex items-center gap-1.5">
                      <Heart className="w-4 h-4" /> Trusted
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Top Bar Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <span className="hidden sm:block text-xs bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1 rounded">
                More Options
              </span>
              <div className="relative group">
                <button className="text-white bg-teal-600 hover:bg-teal-700 p-3 rounded-lg cursor-pointer transition-colors">
                  <Menu className="w-4 h-4" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-3 border-b border-slate-200">
                    <p className="text-sm font-semibold text-slate-900">Account</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2 border-t border-slate-200"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 min-h-0 overflow-y-auto bg-slate-50 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default MasterLayout
