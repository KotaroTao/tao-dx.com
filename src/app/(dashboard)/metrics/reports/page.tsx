'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import {
  FileDown,
  FileSpreadsheet,
  FileJson,
  Calendar,
  Loader2,
  Download,
  AlertCircle,
} from 'lucide-react';

export default function ReportsPage() {
  const { data: session } = useSession();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([]);
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [exporting, setExporting] = useState(false);
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
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  // エクスポート
  const exportData = async () => {
    if (!clinicId) return;

    setExporting(true);
    try {
      const params = new URLSearchParams({
        clinicId,
        startDate,
        endDate,
        format,
      });

      const res = await fetch(`/api/metrics/export?${params}`);
      if (!res.ok) {
        throw new Error('Export failed');
      }

      const contentType = res.headers.get('content-type');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metrics_${startDate}_${endDate}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('エクスポートに失敗しました');
    } finally {
      setExporting(false);
    }
  };

  // 期間プリセット
  const setPeriodPreset = (preset: string) => {
    const end = new Date();
    let start = new Date();

    switch (preset) {
      case 'week':
        start.setDate(end.getDate() - 7);
        break;
      case 'month':
        start.setMonth(end.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(end.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(end.getFullYear() - 1);
        break;
      case 'thisMonth':
        start = new Date(end.getFullYear(), end.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(end.getFullYear(), end.getMonth() - 1, 1);
        end.setDate(0); // 前月末日
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end.toISOString().split('T')[0]);
  };

  if (loading) {
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
          <FileDown className="w-7 h-7 text-purple-600" />
          レポート・エクスポート
        </h1>
        <p className="text-gray-600">メトリクスデータをCSVまたはJSON形式でダウンロードできます</p>
      </div>

      {/* エクスポート設定 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">エクスポート設定</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* クリニック選択 */}
          {clinics.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">クリニック</label>
              <select
                value={clinicId || ''}
                onChange={(e) => setClinicId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {clinics.map((clinic) => (
                  <option key={clinic.id} value={clinic.id}>
                    {clinic.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 期間選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">期間</label>
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => setPeriodPreset('week')}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                過去1週間
              </button>
              <button
                onClick={() => setPeriodPreset('month')}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                過去1ヶ月
              </button>
              <button
                onClick={() => setPeriodPreset('quarter')}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                過去3ヶ月
              </button>
              <button
                onClick={() => setPeriodPreset('year')}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                過去1年
              </button>
              <button
                onClick={() => setPeriodPreset('thisMonth')}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                今月
              </button>
              <button
                onClick={() => setPeriodPreset('lastMonth')}
                className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg"
              >
                先月
              </button>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <span className="text-gray-500">〜</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* フォーマット選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ファイル形式</label>
            <div className="flex gap-4">
              <button
                onClick={() => setFormat('csv')}
                className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  format === 'csv'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileSpreadsheet className={`w-8 h-8 ${format === 'csv' ? 'text-purple-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${format === 'csv' ? 'text-purple-700' : 'text-gray-700'}`}>
                  CSV
                </span>
                <span className="text-xs text-gray-500">Excel、スプレッドシート向け</span>
              </button>
              <button
                onClick={() => setFormat('json')}
                className={`flex-1 p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                  format === 'json'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileJson className={`w-8 h-8 ${format === 'json' ? 'text-purple-600' : 'text-gray-400'}`} />
                <span className={`font-medium ${format === 'json' ? 'text-purple-700' : 'text-gray-700'}`}>
                  JSON
                </span>
                <span className="text-xs text-gray-500">プログラム連携向け</span>
              </button>
            </div>
          </div>

          {/* エクスポートボタン */}
          <div className="pt-4">
            <button
              onClick={exportData}
              disabled={exporting || !clinicId}
              className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
            >
              {exporting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {exporting ? 'エクスポート中...' : 'データをエクスポート'}
            </button>
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">エクスポートについて</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>エクスポートには選択した期間の全ての日次データが含まれます</li>
              <li>CSVファイルはExcel、Googleスプレッドシートで開くことができます</li>
              <li>JSONファイルは外部システムとの連携に適しています</li>
              <li>大量のデータをエクスポートする場合、時間がかかることがあります</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
