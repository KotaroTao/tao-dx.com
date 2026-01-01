'use client'

import { Header } from '@/components/header'
import { useSession } from 'next-auth/react'
import { User, Bell, Shield, Palette } from 'lucide-react'

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <>
      <Header
        title="設定"
        subtitle="アプリケーションの設定を管理"
      />

      <div className="max-w-3xl space-y-6">
        {/* プロフィール */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold">プロフィール</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                名前
              </label>
              <input
                type="text"
                defaultValue={session?.user?.name || ''}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                メールアドレス
              </label>
              <input
                type="email"
                defaultValue={session?.user?.email || ''}
                disabled
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* 通知 */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold">通知</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300">メール通知</span>
              <input type="checkbox" className="sr-only peer" />
              <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-300">タスクリマインダー</span>
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="relative w-11 h-6 bg-gray-700 rounded-full peer peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>
        </div>

        {/* セキュリティ */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold">セキュリティ</h2>
          </div>

          <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
            パスワードを変更
          </button>
        </div>

        {/* テーマ */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Palette className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold">外観</h2>
          </div>

          <div className="flex gap-4">
            <button className="px-4 py-2 bg-purple-600/20 border border-purple-500/20 rounded-lg text-purple-400">
              ダーク
            </button>
            <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 opacity-50 cursor-not-allowed">
              ライト（準備中）
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
