import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">
        T.A.O Marketing System
      </h1>

      <p className="text-xl md:text-2xl text-gray-300 mb-8">
        Think / Act / Optimize
      </p>

      <div className="flex flex-wrap justify-center gap-6 mb-12">
        <Card
          title="Think"
          subtitle="考える"
          description="データに基づいた戦略立案"
        />
        <Card
          title="Act"
          subtitle="動く"
          description="効率的な実行と自動化"
        />
        <Card
          title="Optimize"
          subtitle="改善する"
          description="継続的な改善サイクル"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-lg font-medium transition-all"
        >
          ログイン
          <ArrowRight className="w-5 h-5" />
        </Link>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg font-medium transition-all"
        >
          ダッシュボード
        </Link>
      </div>

      <p className="mt-16 text-gray-500 text-sm">
        by 田尾耕太郎
      </p>
    </main>
  )
}

function Card({ title, subtitle, description }: {
  title: string
  subtitle: string
  description: string
}) {
  return (
    <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 w-64 border border-white/10 hover:border-purple-500/30 transition-colors">
      <h2 className="text-3xl font-bold mb-2">{title}</h2>
      <p className="text-lg text-gray-400 mb-3">{subtitle}</p>
      <p className="text-gray-500">{description}</p>
    </div>
  )
}
