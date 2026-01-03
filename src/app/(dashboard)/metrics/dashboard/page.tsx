'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  UserPlus,
  DollarSign,
  Percent,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  BarChart3,
  Target,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';

interface SummaryData {
  period: {
    type: string;
    year: number;
    month: number | null;
    startDate: string;
    endDate: string;
  };
  summary: {
    totalRevenue: number;
    totalPatients: number;
    totalNewPatients: number;
    selfPayRatio: number;
    avgRevenuePerPatient: number;
  };
  comparison: {
    revenueChange: number;
    patientsChange: number;
    newPatientsChange: number;
    prevTotalRevenue: number;
    prevTotalPatients: number;
    prevTotalNewPatients: number;
  };
  byCategory: {
    categoryId: string;
    categoryName: string;
    categoryColor: string;
    totalRevenue: number;
    totalPatients: number;
    items: {
      itemId: string;
      itemName: string;
      unit: string;
      type: string;
      sum: number;
      count: number;
      avg: number;
      target?: number;
      achievementRate?: number;
    }[];
  }[];
  goals: {
    itemId: string;
    itemName: string;
    targetValue: number;
    actualValue: number;
  }[];
}

export default function MetricsDashboardPage() {
  const { data: session } = useSession();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([]);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [periodType, setPeriodType] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [loading, setLoading] = useState(true);

  // クリニック一覧を取得
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        const res = await fetch('/api/clinics');
        if (res.ok) {
          const data = await res.json();
          setClinics(data);
          if (data.length > 0) {
            setClinicId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching clinics:', error);
      }
    };
    fetchClinics();
  }, []);

  // サマリーデータを取得
  const fetchSummary = useCallback(async () => {
    if (!clinicId) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        clinicId,
        periodType,
        year: year.toString(),
        ...(periodType === 'MONTHLY' && { month: month.toString() }),
      });

      const res = await fetch(`/api/metrics/summary?${params}`);
      if (res.ok) {
        const data = await res.json();
        setSummaryData(data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    } finally {
      setLoading(false);
    }
  }, [clinicId, periodType, year, month]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // 期間を変更
  const changePeriod = (direction: number) => {
    if (periodType === 'MONTHLY') {
      let newMonth = month + direction;
      let newYear = year;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      } else if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
      setMonth(newMonth);
      setYear(newYear);
    } else {
      setYear(year + direction);
    }
  };

  // 数値をフォーマット
  const formatNumber = (value: number, unit?: string) => {
    if (unit === '円' || unit === '万円') {
      return value.toLocaleString('ja-JP');
    }
    return value.toLocaleString('ja-JP', { maximumFractionDigits: 1 });
  };

  // 変化率の表示
  const renderChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <span className={`flex items-center text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
        {isPositive ? '+' : ''}
        {change.toFixed(1)}%
      </span>
    );
  };

  if (loading && !clinicId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (clinics.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            クリニックが登録されていません。まずスコアリング画面でクリニックを登録してください。
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">メトリクスダッシュボード</h1>
        <p className="text-gray-600">経営データの分析と可視化</p>
      </div>

      {/* コントロール */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* クリニック選択 */}
        {clinics.length > 1 && (
          <select
            value={clinicId || ''}
            onChange={(e) => setClinicId(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {clinics.map((clinic) => (
              <option key={clinic.id} value={clinic.id}>
                {clinic.name}
              </option>
            ))}
          </select>
        )}

        {/* 期間タイプ選択 */}
        <div className="flex rounded-lg border border-gray-300 overflow-hidden">
          <button
            onClick={() => setPeriodType('MONTHLY')}
            className={`px-4 py-2 text-sm font-medium ${
              periodType === 'MONTHLY'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            月次
          </button>
          <button
            onClick={() => setPeriodType('YEARLY')}
            className={`px-4 py-2 text-sm font-medium ${
              periodType === 'YEARLY'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            年次
          </button>
        </div>

        {/* 期間選択 */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => changePeriod(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg">
            <Calendar className="w-5 h-5 text-purple-600" />
            <span className="font-semibold">
              {year}年{periodType === 'MONTHLY' ? `${month}月` : ''}
            </span>
          </div>
          <button
            onClick={() => changePeriod(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : summaryData ? (
        <>
          {/* KPIカード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* 売上 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
                {renderChange(summaryData.comparison.revenueChange)}
              </div>
              <p className="text-sm text-gray-600 mb-1">売上合計</p>
              <p className="text-2xl font-bold text-gray-900">
                ¥{formatNumber(summaryData.summary.totalRevenue)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                前期: ¥{formatNumber(summaryData.comparison.prevTotalRevenue)}
              </p>
            </div>

            {/* 患者数 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                {renderChange(summaryData.comparison.patientsChange)}
              </div>
              <p className="text-sm text-gray-600 mb-1">患者数合計</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(summaryData.summary.totalPatients)}人
              </p>
              <p className="text-xs text-gray-500 mt-1">
                前期: {formatNumber(summaryData.comparison.prevTotalPatients)}人
              </p>
            </div>

            {/* 新患数 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <UserPlus className="w-6 h-6 text-purple-600" />
                </div>
                {renderChange(summaryData.comparison.newPatientsChange)}
              </div>
              <p className="text-sm text-gray-600 mb-1">新患数合計</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(summaryData.summary.totalNewPatients)}人
              </p>
              <p className="text-xs text-gray-500 mt-1">
                前期: {formatNumber(summaryData.comparison.prevTotalNewPatients)}人
              </p>
            </div>

            {/* 自費率 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Percent className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">自費率</p>
              <p className="text-2xl font-bold text-gray-900">
                {summaryData.summary.selfPayRatio.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                患者単価: ¥{formatNumber(summaryData.summary.avgRevenuePerPatient)}
              </p>
            </div>
          </div>

          {/* カテゴリ別実績 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                カテゴリ別実績
              </h2>
            </div>
            <div className="p-6">
              {summaryData.byCategory.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  データがありません。日次入力からデータを登録してください。
                </div>
              ) : (
                <div className="space-y-6">
                  {summaryData.byCategory.map((category) => (
                    <div key={category.categoryId} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                      <div className="flex items-center gap-2 mb-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.categoryColor }}
                        />
                        <h3 className="font-medium text-gray-900">{category.categoryName}</h3>
                        <span className="text-sm text-gray-500 ml-auto">
                          売上: ¥{formatNumber(category.totalRevenue)} / 患者: {formatNumber(category.totalPatients)}人
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {category.items.map((item) => (
                          <div key={item.itemId} className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xs text-gray-500 mb-1">{item.itemName}</p>
                            <p className="font-semibold text-gray-900">
                              {formatNumber(item.sum, item.unit)}
                              <span className="text-sm font-normal text-gray-500 ml-1">{item.unit}</span>
                            </p>
                            {item.target && (
                              <div className="mt-2">
                                <div className="flex justify-between text-xs mb-1">
                                  <span className="text-gray-500">目標達成率</span>
                                  <span className={item.achievementRate && item.achievementRate >= 100 ? 'text-green-600' : 'text-orange-600'}>
                                    {item.achievementRate?.toFixed(1)}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className={`h-1.5 rounded-full ${
                                      item.achievementRate && item.achievementRate >= 100 ? 'bg-green-500' : 'bg-orange-500'
                                    }`}
                                    style={{ width: `${Math.min(item.achievementRate || 0, 100)}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 目標達成状況 */}
          {summaryData.goals.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  目標達成状況
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {summaryData.goals.map((goal) => {
                    const achievementRate = goal.targetValue > 0 ? (goal.actualValue / goal.targetValue) * 100 : 0;
                    const isAchieved = achievementRate >= 100;
                    return (
                      <div key={goal.itemId} className="border border-gray-200 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-2">{goal.itemName}</p>
                        <div className="flex items-end justify-between mb-2">
                          <span className="text-xl font-bold text-gray-900">
                            {formatNumber(goal.actualValue)}
                          </span>
                          <span className="text-sm text-gray-500">
                            / {formatNumber(goal.targetValue)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              isAchieved ? 'bg-green-500' : 'bg-purple-500'
                            }`}
                            style={{ width: `${Math.min(achievementRate, 100)}%` }}
                          />
                        </div>
                        <p className={`text-sm font-medium ${isAchieved ? 'text-green-600' : 'text-gray-600'}`}>
                          {achievementRate.toFixed(1)}%
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* クイックリンク */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/metrics/daily"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">日次入力</h3>
                <p className="text-sm text-gray-500">毎日のデータを入力</p>
              </div>
            </Link>

            <Link
              href="/metrics/goals"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">目標設定</h3>
                <p className="text-sm text-gray-500">月次・年次目標を設定</p>
              </div>
            </Link>

            <Link
              href="/metrics/settings"
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow flex items-center gap-4"
            >
              <div className="p-3 bg-orange-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">設定</h3>
                <p className="text-sm text-gray-500">カテゴリ・項目を管理</p>
              </div>
            </Link>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">データを取得できませんでした</p>
        </div>
      )}
    </div>
  );
}
