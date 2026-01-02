import { Header } from '@/components/header'
import Link from 'next/link'
import { Plus, Filter } from 'lucide-react'

export default function TasksPage() {
  return (
    <>
      <Header
        title="タスク"
        subtitle="タスクの管理と進捗追跡"
      />

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors">
            <Filter className="w-4 h-4" />
            フィルター
          </button>
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            <button className="px-4 py-2 bg-purple-600/20 text-purple-400 font-medium text-sm">
              すべて
            </button>
            <button className="px-4 py-2 text-gray-400 hover:bg-white/5 font-medium text-sm">
              未着手
            </button>
            <button className="px-4 py-2 text-gray-400 hover:bg-white/5 font-medium text-sm">
              進行中
            </button>
            <button className="px-4 py-2 text-gray-400 hover:bg-white/5 font-medium text-sm">
              完了
            </button>
          </div>
        </div>

        <Link
          href="/tasks/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg font-medium transition-all"
        >
          <Plus className="w-5 h-5" />
          タスクを追加
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 未着手 */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-300">未着手</h3>
            <span className="px-2 py-1 bg-gray-500/20 rounded text-xs text-gray-400">0</span>
          </div>
          <div className="text-center py-8 text-gray-500 text-sm">
            タスクがありません
          </div>
        </div>

        {/* 進行中 */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-blue-400">進行中</h3>
            <span className="px-2 py-1 bg-blue-500/20 rounded text-xs text-blue-400">0</span>
          </div>
          <div className="text-center py-8 text-gray-500 text-sm">
            タスクがありません
          </div>
        </div>

        {/* 完了 */}
        <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-green-400">完了</h3>
            <span className="px-2 py-1 bg-green-500/20 rounded text-xs text-green-400">0</span>
          </div>
          <div className="text-center py-8 text-gray-500 text-sm">
            タスクがありません
          </div>
        </div>
      </div>
    </>
  )
}
