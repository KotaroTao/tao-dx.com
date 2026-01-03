'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { ChevronLeft, ChevronRight, Calendar, Save, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface MetricItem {
  id: string;
  name: string;
  type: string;
  unit: string;
  categoryId: string;
}

interface MetricCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  items: MetricItem[];
}

interface MetricEntry {
  itemId: string;
  value: number;
  note?: string;
}

export default function DailyMetricsPage() {
  const { data: session } = useSession();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<MetricCategory[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<Record<string, number>>({});
  const [dailyNote, setDailyNote] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [needsInit, setNeedsInit] = useState(false);

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

  // カテゴリと項目を取得
  const fetchCategories = useCallback(async () => {
    if (!clinicId) return;

    try {
      const res = await fetch(`/api/metrics/categories?clinicId=${clinicId}`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
        if (data.length === 0) {
          setNeedsInit(true);
        } else {
          setNeedsInit(false);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, [clinicId]);

  // 日次データを取得
  const fetchDailyData = useCallback(async () => {
    if (!clinicId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/metrics/daily?clinicId=${clinicId}&date=${date}`);
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const entryData: Record<string, number> = {};
          data[0].metrics.forEach((m: { itemId: string; value: number }) => {
            entryData[m.itemId] = parseFloat(m.value.toString());
          });
          setEntries(entryData);
          setDailyNote(data[0].note || '');
        } else {
          setEntries({});
          setDailyNote('');
        }
      }
    } catch (error) {
      console.error('Error fetching daily data:', error);
    } finally {
      setLoading(false);
    }
  }, [clinicId, date]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (categories.length > 0) {
      fetchDailyData();
    } else {
      setLoading(false);
    }
  }, [fetchDailyData, categories.length]);

  // デフォルトカテゴリを初期化
  const initializeDefaults = async () => {
    if (!clinicId) return;

    setSaving(true);
    try {
      const res = await fetch('/api/metrics/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicId, createDefaults: true }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'デフォルトカテゴリを作成しました' });
        await fetchCategories();
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || '初期化に失敗しました' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '初期化に失敗しました' });
    } finally {
      setSaving(false);
    }
  };

  // 値を更新
  const updateEntry = (itemId: string, value: string) => {
    const numValue = value === '' ? 0 : parseFloat(value);
    setEntries((prev) => ({ ...prev, [itemId]: numValue }));
  };

  // 保存
  const saveData = async () => {
    if (!clinicId) return;

    setSaving(true);
    setMessage(null);

    try {
      const entryArray = Object.entries(entries)
        .filter(([_, value]) => value !== 0)
        .map(([itemId, value]) => ({ itemId, value }));

      const res = await fetch('/api/metrics/daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          date,
          entries: entryArray,
          dailyNote,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '保存しました' });
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

  // 日付を変更
  const changeDate = (days: number) => {
    const current = new Date(date);
    current.setDate(current.getDate() + days);
    setDate(current.toISOString().split('T')[0]);
  };

  // 曜日を取得
  const getDayOfWeek = (dateStr: string) => {
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return days[new Date(dateStr).getDay()];
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
    <div className="p-6 max-w-4xl mx-auto">
      {/* ヘッダー */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">日次メトリクス入力</h1>
        <p className="text-gray-600">毎日の経営データを記録します</p>
      </div>

      {/* クリニック選択 */}
      {clinics.length > 1 && (
        <div className="mb-4">
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
        </div>
      )}

      {/* 日付選択 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => changeDate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-purple-600" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-lg font-semibold bg-transparent border-none focus:ring-0 cursor-pointer"
            />
            <span className="text-lg font-semibold text-gray-600">({getDayOfWeek(date)})</span>
          </div>
          <button
            onClick={() => changeDate(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
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

      {/* 初期化が必要な場合 */}
      {needsInit && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">初期設定が必要です</h3>
          <p className="text-blue-700 mb-4">
            メトリクス機能を使用するには、まずデフォルトのカテゴリと項目を作成する必要があります。
          </p>
          <button
            onClick={initializeDefaults}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            デフォルトカテゴリを作成
          </button>
        </div>
      )}

      {/* カテゴリ別入力フォーム */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : (
        <>
          {categories.map((category) => (
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
                  {category.items.map((item) => (
                    <div key={item.id}>
                      <label className="block text-sm text-gray-600 mb-1">{item.name}</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={entries[item.id] || ''}
                          onChange={(e) => updateEntry(item.id, e.target.value)}
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

          {/* 本日のメモ */}
          {categories.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
              <div className="px-4 py-3 border-b bg-gray-50">
                <h3 className="font-semibold text-gray-700">本日のメモ</h3>
              </div>
              <div className="p-4">
                <textarea
                  value={dailyNote}
                  onChange={(e) => setDailyNote(e.target.value)}
                  placeholder="特記事項があれば入力してください"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}

          {/* 保存ボタン */}
          {categories.length > 0 && (
            <div className="flex justify-end gap-3">
              <button
                onClick={saveData}
                disabled={saving}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2 font-medium"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                保存
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
