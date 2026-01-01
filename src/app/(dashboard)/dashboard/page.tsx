import { Header } from '@/components/header'
import { Users, CheckSquare, Megaphone, TrendingUp } from 'lucide-react'

const stats = [
  {
    label: '顧客数',
    value: '0',
    change: '+0%',
    icon: Users,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
  },
  {
    label: 'アクティブタスク',
    value: '0',
    change: '+0%',
    icon: CheckSquare,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
  },
  {
    label: 'キャンペーン',
    value: '0',
    change: '+0%',
    icon: Megaphone,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
  },
  {
    label: 'コンバージョン率',
    value: '0%',
    change: '+0%',
    icon: TrendingUp,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
  },
]

export default function DashboardPage() {
  return (
    <>
      <Header
        title="ダッシュボード"
        subtitle="マーケティング活動の概要を確認できます"
      />

      {/* KPIカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={`${stat.bgColor} backdrop-blur-lg rounded-xl p-6 border ${stat.borderColor}`}
            >
              <div className="flex items-center justify-between mb-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <span className="text-xs text-green-400 font-medium">
                  {stat.change}
                </span>
              </div>
              <p className="text-3xl font-bold text-white mb-1">{stat.value}</p>
              <p className="text-sm text-gray-400">{stat.label}</p>
            </div>
          )
        })}
      </div>

      {/* クイックアクション */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">
            最近のアクティビティ
          </h2>
          <div className="text-center py-8 text-gray-400">
            <p>まだアクティビティがありません</p>
            <p className="text-sm mt-2">
              顧客やタスクを追加するとここに表示されます
            </p>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-lg rounded-xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">
            今日のタスク
          </h2>
          <div className="text-center py-8 text-gray-400">
            <p>今日のタスクはありません</p>
            <p className="text-sm mt-2">
              タスクを作成して生産性を高めましょう
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
