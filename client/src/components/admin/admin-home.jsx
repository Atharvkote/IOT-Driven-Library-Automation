"use client"

import { BarChart3, Users, BookOpen, CheckCircle, AlertCircle, TrendingUp, Settings, Shield } from "lucide-react"
import { GiBookmarklet } from "react-icons/gi"

export default function AdminLanding() {
  const stats = [
    { label: "Total Books", value: "5,240", icon: BookOpen, color: "bg-blue-100 text-blue-600" },
    { label: "Active Users", value: "1,850", icon: Users, color: "bg-green-100 text-green-600" },
    { label: "Pending Requests", value: "42", icon: AlertCircle, color: "bg-amber-100 text-amber-600" },
    { label: "Approved Today", value: "28", icon: CheckCircle, color: "bg-teal-100 text-teal-600" },
  ]

  const features = [
    {
      title: "Book Management",
      description:
        "Add, edit, and manage your library catalog with ease. Track inventory and availability in real-time.",
      icon: BookOpen,
      stats: "5,240 books",
    },
    {
      title: "User Management",
      description: "Manage student accounts, credits, and borrowing history. Monitor user activity and engagement.",
      icon: Users,
      stats: "1,850 users",
    },
    {
      title: "Request Approval",
      description: "Review and approve/reject book requests from students. Set borrowing policies and return dates.",
      icon: CheckCircle,
      stats: "42 pending",
    },
    {
      title: "Analytics & Reports",
      description: "View detailed analytics on book circulation, popular titles, and user engagement metrics.",
      icon: BarChart3,
      stats: "Real-time data",
    },
    {
      title: "Access Control",
      description: "Manage admin roles and permissions. Control who can approve requests and manage inventory.",
      icon: Shield,
      stats: "3 roles",
    },
    {
      title: "System Settings",
      description: "Configure library policies, borrowing limits, credit system, and notification preferences.",
      icon: Settings,
      stats: "Customizable",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b rounded-2xl border-slate-200 shadow-sm top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GiBookmarklet className="w-10 h-10 text-teal-600" />
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          </div>
          <button className="px-6 cursor-pointer py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg transition-colors">
            Sign Out
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-teal-50 to-teal-100/50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">Library Administration</h2>
            <p className="text-lg text-slate-600 mb-8">
              Manage your digital library, approve requests, and monitor system performance from one centralized
              dashboard.
            </p>
            <div className="flex gap-4">
              <button className="px-8 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition-colors">
                Go to Dashboard
              </button>
              <button className="px-8 py-3 bg-white border-2 border-teal-600 text-teal-600 hover:bg-teal-50 font-semibold rounded-lg transition-colors">
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <h3 className="text-2xl font-bold text-slate-900 mb-6">Quick Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm text-slate-600 font-medium mb-1">{stat.label}</p>
                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Features Overview */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <div className="mb-12">
          <h3 className="text-3xl font-bold text-slate-900 mb-4">Core Features</h3>
          <p className="text-slate-600 text-lg">
            Comprehensive tools to manage every aspect of your digital library system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group"
              >
                {/* Feature Header */}
                <div className="bg-gradient-to-r from-teal-50 to-teal-100/50 p-6 border-b border-slate-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 text-xs font-semibold rounded-full">
                      {feature.stats}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                    {feature.title}
                  </h4>
                </div>

                {/* Feature Body */}
                <div className="p-6">
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{feature.description}</p>
                  <button className="w-full px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-600 font-medium rounded-lg transition-colors text-sm border border-teal-200">
                    Learn More
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className="bg-gradient-to-r from-teal-50 to-teal-100/50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-16">
          <h3 className="text-3xl font-bold text-slate-900 mb-8">System Performance</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">System Uptime</p>
                  <p className="text-2xl font-bold text-slate-900">99.9%</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">Last 30 days</p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Avg Response Time</p>
                  <p className="text-2xl font-bold text-slate-900">245ms</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">Database queries</p>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-600 font-medium">Requests Processed</p>
                  <p className="text-2xl font-bold text-slate-900">1,240</p>
                </div>
              </div>
              <p className="text-xs text-slate-500">This month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 text-white border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="font-semibold mb-4">Administration</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Dashboard
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Settings
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Management</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Books
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Users
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Monitoring</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Analytics
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Reports
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Support</h5>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Help
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-sm text-slate-400">
            <p>&copy; 2025 Digital Library Admin. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
