'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Megaphone,
  Settings,
  LogOut,
  BarChart3,
  ClipboardList,
  ChevronDown,
  ChevronRight,
  Calendar,
  Target,
  Bell,
  FileDown,
  Cog,
} from 'lucide-react'
import { signOut } from 'next-auth/react'

const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/scoring', label: 'スコアリング', icon: BarChart3 },
  { href: '/customers', label: '顧客管理', icon: Users },
  { href: '/tasks', label: 'タスク', icon: CheckSquare },
  { href: '/campaigns', label: 'キャンペーン', icon: Megaphone },
  { href: '/settings', label: '設定', icon: Settings },
]

const metricsSubItems = [
  { href: '/metrics/dashboard', label: 'ダッシュボード', icon: BarChart3 },
  { href: '/metrics/daily', label: '日次入力', icon: Calendar },
  { href: '/metrics/goals', label: '目標設定', icon: Target },
  { href: '/metrics/alerts', label: 'アラート', icon: Bell },
  { href: '/metrics/reports', label: 'レポート', icon: FileDown },
  { href: '/metrics/settings', label: '項目設定', icon: Cog },
]

export function Sidebar() {
  const pathname = usePathname()
  const [metricsExpanded, setMetricsExpanded] = useState(pathname.startsWith('/metrics'))
  const isMetricsActive = pathname.startsWith('/metrics')

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-black/20 backdrop-blur-lg border-r border-white/10 flex flex-col">
      <div className="p-6">
        <Link href="/dashboard" className="block">
          <h1 className="text-5xl font-black gradient-text tracking-widest leading-none">T.A.O</h1>
          <p className="text-xs text-gray-400 mt-2 tracking-[0.3em] uppercase font-medium">Marketing System</p>
        </Link>
      </div>

      <nav className="flex-1 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.slice(0, 2).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}

          {/* メトリクスメニュー */}
          <li>
            <button
              onClick={() => setMetricsExpanded(!metricsExpanded)}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors ${
                isMetricsActive
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-5 h-5" />
                <span className="font-medium">メトリクス</span>
              </div>
              {metricsExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            {metricsExpanded && (
              <ul className="mt-1 ml-4 space-y-1">
                {metricsSubItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm ${
                          isActive
                            ? 'bg-purple-600/20 text-purple-400'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </li>

          {navItems.slice(2).map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-600/20 text-purple-400 border border-purple-500/20'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">ログアウト</span>
        </button>
      </div>
    </aside>
  )
}
