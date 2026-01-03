'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Target, Save, Loader2, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';

interface MetricItem {
  id: string;
  name: string;
  type: string;
  unit: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
}

interface Goal {
  id: string;
  itemId: string;
  period: 'MONTHLY' | 'YEARLY';
  year: number;
  month: number | null;
  targetValue: number;
}

export default function GoalsPage() {
  const { data: session } = useSession();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([]);
  const [items, setItems] = useState<MetricItem[]>([]);
  const [goals, setGoals] = useState<Record<string, number>>({});
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [periodType, setPeriodType] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  // 項目一覧を取得
  const fetchItems = useCallback(async () => {
    if (!clinicId) return;

    try {
      const res = await fetch(`/api/metrics/items?clinicId=${clinicId}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  }, [clinicId]);

  // 目標を取得
  const fetchGoals = useCallback(async () => {
    if (!clinicId) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        clinicId,
        period: periodType,
        year: year.toString(),
        ...(periodType === 'MONTHLY' && { month: month.toString() }),
      });

      const res = await fetch(`/api/metrics/goals?${params}`);
      if (res.ok) {
        const data: Goal[] = await res.json();
        const goalData: Record<string, number> = {};
        data.forEach((g) => {
          goalData[g.itemId] = parseFloat(g.targetValue.toString());
        });
        setGoals(goalData);
      }
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  }, [clinicId, periodType, year, month]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    if (items.length > 0) {
      fetchGoals();
    } else {
      setLoading(false);
    }
  }, [fetchGoals, items.length]);

  // 目標値を更新
  const updateGoal = (itemId: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setGoals((prev) => ({ ...prev, [itemId]: numValue }));
  };

  // 保存
  const saveGoals = async () => {
    if (!clinicId) return;

    setSaving(true);
    setMessage(null);

    try {
      const goalsArray = Object.entries(goals)
        .filter(([_, value]) => value > 0)
        .map(([itemId, targetValue]) => ({
          itemId,
          targetValue,
        }));

      const res = await fetch('/api/metrics/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          period: periodType,
          year,
          month: periodType === 'MONTHLY' ? month : null,
          goals: goalsArray,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '目標を保存しました' });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || '保存に失敗しました' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '保存に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  // カテゴリごとにグループ化
  const itemsByCategory = items.reduce(
    (acc, item) => {
      if (!acc[item.categoryId]) {
        acc[item.categoryId] = {
          category: item.category,
          items: [],
        };
      }
      acc[item.categoryId].items.push(item);
      return acc;
    },
    {} as Record<string, { category: MetricItem['category']; items: MetricItem[] }>
  );

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
    <div className="p-6 max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Target className="w-7 h-7 text-purple-600" />
          目標設定
        </h1>
        <p className="text-gray-600">月次・年次の目標値を設定します</p>
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
            月次目標
          </button>
          <button
            onClick={() => setPeriodType('YEARLY')}
            className={`px-4 py-2 text-sm font-medium ${
              periodType === 'YEARLY'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            年次目標
          </button>
        </div>

        {/* 年月選択 */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {[...Array(5)].map((_, i) => {
              const y = new Date().getFullYear() - 2 + i;
              return (
                <option key={y} value={y}>
                  {y}年
                </option>
              );
            })}
          </select>
          {periodType === 'MONTHLY' && (
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}月
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* メッセージ */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          {message.text}
        </div>
      )}

      {/* 目標入力フォーム */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800">
            メトリクス項目が登録されていません。
            <br />
            まず日次入力画面でデフォルトカテゴリを作成してください。
          </p>
        </div>
      ) : (
        <>
          {Object.values(itemsByCategory).map(({ category, items: categoryItems }) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 mb-4 overflow-hidden"
            >
              <div
                className="px-4 py-3 border-b"
                style={{ backgroundColor: `${category.color}15`, borderColor: `${category.color}30` }}
              >
                <h3 className="font-semibold" style={{ color: category.color }}>
                  {category.name}
                </h3>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {categoryItems.map((item) => (
                    <div key={item.id}>
                      <label className="block text-sm text-gray-600 mb-1">{item.name}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={goals[item.id] || ''}
                          onChange={(e) => updateGoal(item.id, e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-right"
                        />
                        <span className="text-sm text-gray-500 w-8">{item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* 保存ボタン */}
          <div className="flex justify-end gap-3">
            <button
              onClick={saveGoals}
              disabled={saving}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 font-medium"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              目標を保存
            </button>
          </div>
        </>
      )}
    </div>
  );
}
