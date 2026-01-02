import { Header } from '@/components/header'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

export default function CustomersPage() {
  return (
    <>
      <Header
        title="顧客管理"
        subtitle="顧客情報の管理と追跡"
      />

      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="顧客を検索..."
            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors w-80"
          />
        </div>

        <Link
          href="/customers/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg font-medium transition-all"
        >
          <Plus className="w-5 h-5" />
          顧客を追加
        </Link>
      </div>

      <div className="bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">名前</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">会社</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">メール</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">ステータス</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-400">作成日</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                  <p>まだ顧客が登録されていません</p>
                  <p className="text-sm mt-2">「顧客を追加」ボタンから最初の顧客を追加しましょう</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
