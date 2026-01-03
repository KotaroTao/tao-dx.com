'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Bell,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface MetricItem {
  id: string;
  name: string;
  category: {
    id: string;
    name: string;
    color: string;
  };
}

interface AlertSetting {
  id: string;
  itemId: string;
  item: MetricItem;
  condition: 'ABOVE' | 'BELOW' | 'EQUAL';
  threshold: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  isActive: boolean;
  notificationChannels: string[];
}

export default function AlertsPage() {
  const { data: session } = useSession();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([]);
  const [items, setItems] = useState<MetricItem[]>([]);
  const [alerts, setAlerts] = useState<AlertSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // モーダル状態
  const [showModal, setShowModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertSetting | null>(null);

  // フォーム状態
  const [form, setForm] = useState({
    itemId: '',
    condition: 'BELOW' as 'ABOVE' | 'BELOW' | 'EQUAL',
    threshold: 0,
    severity: 'WARNING' as 'INFO' | 'WARNING' | 'CRITICAL',
    notificationChannels: ['IN_APP'] as string[],
  });

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

  // アラート一覧を取得
  const fetchAlerts = useCallback(async () => {
    if (!clinicId) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/metrics/alerts?clinicId=${clinicId}`);
      if (res.ok) {
        const data = await res.json();
        setAlerts(data);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchItems();
    fetchAlerts();
  }, [fetchItems, fetchAlerts]);

  // モーダルを開く
  const openModal = (alert?: AlertSetting) => {
    if (alert) {
      setEditingAlert(alert);
      setForm({
        itemId: alert.itemId,
        condition: alert.condition,
        threshold: parseFloat(alert.threshold.toString()),
        severity: alert.severity,
        notificationChannels: alert.notificationChannels,
      });
    } else {
      setEditingAlert(null);
      setForm({
        itemId: items.length > 0 ? items[0].id : '',
        condition: 'BELOW',
        threshold: 0,
        severity: 'WARNING',
        notificationChannels: ['IN_APP'],
      });
    }
    setShowModal(true);
  };

  // アラートを保存
  const saveAlert = async () => {
    if (!clinicId || !form.itemId) return;

    setSaving(true);
    try {
      const url = editingAlert
        ? `/api/metrics/alerts?alertId=${editingAlert.id}`
        : '/api/metrics/alerts';
      const method = editingAlert ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          ...form,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `アラートを${editingAlert ? '更新' : '作成'}しました` });
        setShowModal(false);
        await fetchAlerts();
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || '保存に失敗しました' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '保存に失敗しました' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // アラートの有効/無効を切り替え
  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/metrics/alerts?alertId=${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });

      if (res.ok) {
        await fetchAlerts();
      }
    } catch (error) {
      console.error('Error toggling alert:', error);
    }
  };

  // アラートを削除
  const deleteAlert = async (alertId: string) => {
    if (!confirm('このアラートを削除しますか？')) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/metrics/alerts?alertId=${alertId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'アラートを削除しました' });
        await fetchAlerts();
      } else {
        const error = await res.json();
        setMessage({ type: 'error', text: error.error || '削除に失敗しました' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '削除に失敗しました' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  // 条件のラベル
  const conditionLabels = {
    ABOVE: '以上',
    BELOW: '以下',
    EQUAL: '等しい',
  };

  // 重大度のスタイル
  const severityStyles = {
    INFO: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Info },
    WARNING: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertTriangle },
    CRITICAL: { bg: 'bg-red-100', text: 'text-red-700', icon: AlertCircle },
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Bell className="w-7 h-7 text-purple-600" />
          アラート設定
        </h1>
        <p className="text-gray-600">目標未達やしきい値超過時の通知を設定します</p>
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

      {/* アラート追加ボタン */}
      <div className="mb-4">
        <button
          onClick={() => openModal()}
          disabled={items.length === 0}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新しいアラートを追加
        </button>
      </div>

      {/* アラート一覧 */}
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
      ) : alerts.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">アラートが設定されていません</p>
          <p className="text-sm text-gray-500 mt-1">
            上のボタンから新しいアラートを作成してください。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const SeverityIcon = severityStyles[alert.severity].icon;
            return (
              <div
                key={alert.id}
                className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 ${
                  !alert.isActive ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${severityStyles[alert.severity].bg}`}
                    >
                      <SeverityIcon className={`w-5 h-5 ${severityStyles[alert.severity].text}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{alert.item.name}</span>
                        <span
                          className="text-xs px-2 py-0.5 rounded"
                          style={{
                            backgroundColor: `${alert.item.category.color}20`,
                            color: alert.item.category.color,
                          }}
                        >
                          {alert.item.category.name}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {parseFloat(alert.threshold.toString()).toLocaleString()}
                        {conditionLabels[alert.condition]}の場合に通知
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleAlert(alert.id, !alert.isActive)}
                      className="p-1.5 hover:bg-gray-100 rounded"
                      title={alert.isActive ? '無効にする' : '有効にする'}
                    >
                      {alert.isActive ? (
                        <ToggleRight className="w-6 h-6 text-purple-600" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-gray-400" />
                      )}
                    </button>
                    <button
                      onClick={() => openModal(alert)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="編集"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingAlert ? 'アラートを編集' : '新しいアラート'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  対象項目 <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.itemId}
                  onChange={(e) => setForm({ ...form, itemId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.category.name} / {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">条件</label>
                  <select
                    value={form.condition}
                    onChange={(e) =>
                      setForm({ ...form, condition: e.target.value as 'ABOVE' | 'BELOW' | 'EQUAL' })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="BELOW">以下</option>
                    <option value="ABOVE">以上</option>
                    <option value="EQUAL">等しい</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">しきい値</label>
                  <input
                    type="number"
                    value={form.threshold}
                    onChange={(e) => setForm({ ...form, threshold: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">重大度</label>
                <div className="flex gap-2">
                  {(['INFO', 'WARNING', 'CRITICAL'] as const).map((sev) => {
                    const style = severityStyles[sev];
                    const Icon = style.icon;
                    return (
                      <button
                        key={sev}
                        onClick={() => setForm({ ...form, severity: sev })}
                        className={`flex-1 px-3 py-2 rounded-lg border-2 flex items-center justify-center gap-2 ${
                          form.severity === sev
                            ? `${style.bg} ${style.text} border-current`
                            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm">
                          {sev === 'INFO' ? '情報' : sev === 'WARNING' ? '警告' : '重大'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">通知方法</label>
                <div className="flex gap-2">
                  {[
                    { value: 'IN_APP', label: 'アプリ内' },
                    { value: 'EMAIL', label: 'メール' },
                  ].map((channel) => (
                    <button
                      key={channel.value}
                      onClick={() => {
                        const channels = form.notificationChannels.includes(channel.value)
                          ? form.notificationChannels.filter((c) => c !== channel.value)
                          : [...form.notificationChannels, channel.value];
                        setForm({ ...form, notificationChannels: channels });
                      }}
                      className={`px-3 py-2 rounded-lg border ${
                        form.notificationChannels.includes(channel.value)
                          ? 'bg-purple-100 text-purple-700 border-purple-300'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {channel.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                キャンセル
              </button>
              <button
                onClick={saveAlert}
                disabled={saving || !form.itemId}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
