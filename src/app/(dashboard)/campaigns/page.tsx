import { Header } from '@/components/header'
import Link from 'next/link'
import { Plus, Search } from 'lucide-react'

export default function CampaignsPage() {
  return (
    <>
      <Header
        title="キャンペーン"
        subtitle="マーケティングキャンペーンの管理"
      />

      <div className="flex items-center justify-between mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="キャンペーンを検索..."
            className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors w-80"
          />
        </div>

        <Link
          href="/campaigns/new"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg font-medium transition-all"
        >
          <Plus className="w-5 h-5" />
          キャンペーンを作成
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="col-span-full bg-white/5 backdrop-blur-lg rounded-xl border border-white/10 p-12 text-center">
          <div className="text-gray-400">
            <p className="text-lg">まだキャンペーンがありません</p>
            <p className="text-sm mt-2">
              「キャンペーンを作成」ボタンから最初のキャンペーンを作成しましょう
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
