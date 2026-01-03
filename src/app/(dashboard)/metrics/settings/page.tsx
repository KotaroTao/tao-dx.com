'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  FileText,
  X,
} from 'lucide-react';

interface MetricItem {
  id: string;
  name: string;
  type: string;
  unit: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface MetricCategory {
  id: string;
  name: string;
  color: string;
  icon: string;
  description: string | null;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  items: MetricItem[];
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [clinicId, setClinicId] = useState<string | null>(null);
  const [clinics, setClinics] = useState<{ id: string; name: string }[]>([]);
  const [categories, setCategories] = useState<MetricCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // モーダル状態
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MetricCategory | null>(null);
  const [editingItem, setEditingItem] = useState<{ item: MetricItem; categoryId: string } | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // フォーム状態
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    color: '#6366f1',
    description: '',
  });
  const [itemForm, setItemForm] = useState({
    name: '',
    type: 'COUNT',
    unit: '',
    description: '',
  });

  const colors = [
    '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e', '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
    '#0ea5e9', '#3b82f6', '#6b7280',
  ];

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

    setLoading(true);
    try {
      const res = await fetch(`/api/metrics/categories?clinicId=${clinicId}`);
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // カテゴリの展開・折りたたみ
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  // カテゴリモーダルを開く
  const openCategoryModal = (category?: MetricCategory) => {
    if (category) {
      setEditingCategory(category);
      setCategoryForm({
        name: category.name,
        color: category.color,
        description: category.description || '',
      });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', color: '#6366f1', description: '' });
    }
    setShowCategoryModal(true);
  };

  // 項目モーダルを開く
  const openItemModal = (categoryId: string, item?: MetricItem) => {
    setSelectedCategoryId(categoryId);
    if (item) {
      setEditingItem({ item, categoryId });
      setItemForm({
        name: item.name,
        type: item.type,
        unit: item.unit,
        description: item.description || '',
      });
    } else {
      setEditingItem(null);
      setItemForm({ name: '', type: 'COUNT', unit: '', description: '' });
    }
    setShowItemModal(true);
  };

  // カテゴリを保存
  const saveCategory = async () => {
    if (!clinicId || !categoryForm.name.trim()) return;

    setSaving(true);
    try {
      const url = editingCategory
        ? `/api/metrics/categories/${editingCategory.id}`
        : '/api/metrics/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          name: categoryForm.name,
          color: categoryForm.color,
          description: categoryForm.description || null,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `カテゴリを${editingCategory ? '更新' : '作成'}しました` });
        setShowCategoryModal(false);
        await fetchCategories();
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

  // カテゴリを削除
  const deleteCategory = async (categoryId: string) => {
    if (!confirm('このカテゴリと関連する全ての項目を削除しますか？')) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/metrics/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'カテゴリを削除しました' });
        await fetchCategories();
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

  // 項目を保存
  const saveItem = async () => {
    if (!clinicId || !selectedCategoryId || !itemForm.name.trim()) return;

    setSaving(true);
    try {
      const url = editingItem
        ? `/api/metrics/items/${editingItem.item.id}`
        : '/api/metrics/items';
      const method = editingItem ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          categoryId: selectedCategoryId,
          name: itemForm.name,
          type: itemForm.type,
          unit: itemForm.unit,
          description: itemForm.description || null,
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: `項目を${editingItem ? '更新' : '作成'}しました` });
        setShowItemModal(false);
        await fetchCategories();
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

  // 項目を削除
  const deleteItem = async (itemId: string) => {
    if (!confirm('この項目を削除しますか？')) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/metrics/items/${itemId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessage({ type: 'success', text: '項目を削除しました' });
        await fetchCategories();
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
          <Settings className="w-7 h-7 text-purple-600" />
          メトリクス設定
        </h1>
        <p className="text-gray-600">カテゴリと項目の管理</p>
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

      {/* カテゴリ追加ボタン */}
      <div className="mb-4">
        <button
          onClick={() => openCategoryModal()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新しいカテゴリを追加
        </button>
      </div>

      {/* カテゴリ・項目一覧 */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : categories.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">カテゴリがありません</p>
          <p className="text-sm text-gray-500 mt-1">
            上のボタンから新しいカテゴリを作成するか、日次入力画面でデフォルトカテゴリを作成してください。
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* カテゴリヘッダー */}
              <div
                className="px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleCategory(category.id)}
                style={{ borderLeft: `4px solid ${category.color}` }}
              >
                <div className="flex items-center gap-3">
                  {expandedCategories.has(category.id) ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <span className="text-sm text-gray-500">({category.items.length}項目)</span>
                  {category.isDefault && (
                    <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                      デフォルト
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openItemModal(category.id)}
                    className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                    title="項目を追加"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => openCategoryModal(category)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                    title="編集"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  {!category.isDefault && (
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="削除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* 項目一覧 */}
              {expandedCategories.has(category.id) && (
                <div className="border-t border-gray-100 bg-gray-50">
                  {category.items.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">項目がありません</div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {category.items.map((item) => (
                        <div
                          key={item.id}
                          className="px-4 py-3 flex items-center justify-between hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-3 pl-8">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-900">{item.name}</span>
                            <span className="text-sm text-gray-500">
                              ({item.unit || '-'})
                            </span>
                            {item.isDefault && (
                              <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-600 rounded">
                                デフォルト
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openItemModal(category.id, item)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                              title="編集"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {!item.isDefault && (
                              <button
                                onClick={() => deleteItem(item.id)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                                title="削除"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* カテゴリモーダル */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingCategory ? 'カテゴリを編集' : '新しいカテゴリ'}
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  カテゴリ名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="例: 自費診療（矯正）"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">カラー</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setCategoryForm({ ...categoryForm, color })}
                      className={`w-8 h-8 rounded-full border-2 ${
                        categoryForm.color === color ? 'border-gray-900' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="カテゴリの説明（任意）"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                キャンセル
              </button>
              <button
                onClick={saveCategory}
                disabled={saving || !categoryForm.name.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 項目モーダル */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {editingItem ? '項目を編集' : '新しい項目'}
              </h3>
              <button
                onClick={() => setShowItemModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  項目名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemForm.name}
                  onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="例: 売上"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">タイプ</label>
                <select
                  value={itemForm.type}
                  onChange={(e) => setItemForm({ ...itemForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="COUNT">カウント（件数など）</option>
                  <option value="AMOUNT">金額</option>
                  <option value="PERCENTAGE">パーセント</option>
                  <option value="DURATION">時間</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">単位</label>
                <input
                  type="text"
                  value={itemForm.unit}
                  onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="例: 円、人、%"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                <textarea
                  value={itemForm.description}
                  onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  rows={2}
                  placeholder="項目の説明（任意）"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowItemModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                キャンセル
              </button>
              <button
                onClick={saveItem}
                disabled={saving || !itemForm.name.trim()}
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
