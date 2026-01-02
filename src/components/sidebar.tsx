'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Megaphone,
  Settings,
  LogOut,
  BarChart3,
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

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-black/20 backdrop-blur-lg border-r border-white/10 flex flex-col">
      <div className="p-6">
        <Link href="/dashboard" className="block">
          <h1 className="text-4xl font-bold gradient-text tracking-wider">T.A.O</h1>
          <div className="text-[10px] text-gray-400 mt-1 leading-tight tracking-widest uppercase">
            <div>Marketing</div>
            <div>System</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {navItems.map((item) => {
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
