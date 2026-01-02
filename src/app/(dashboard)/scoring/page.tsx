'use client';

import { useState, useEffect } from 'react';
import { ScoreCardGrid } from '@/components/scoring/ScoreCard';
import { SEOScoreDetail } from '@/components/scoring/SEOScoreDetail';
import { SEOEvaluationForm } from '@/components/scoring/SEOEvaluationForm';
import { ScoreCategory, SEOScoreResult, SCORE_CATEGORIES } from '@/types/scoring';
import { Plus, Building, ArrowLeft, Edit, BarChart3, Loader2 } from 'lucide-react';

interface Clinic {
  id: string;
  name: string;
  website: string | null;
  latestScore: {
    homepageScore: number | null;
    seoScore: number | null;
    meoScore: number | null;
    llmoScore: number | null;
    adScore: number | null;
    snsScore: number | null;
    reviewScore: number | null;
    offlineScore: number | null;
  } | null;
}

export default function ScoringPage() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ScoreCategory | null>(null);
  const [seoScoreResult, setSeoScoreResult] = useState<SEOScoreResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showClinicForm, setShowClinicForm] = useState(false);
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicWebsite, setNewClinicWebsite] = useState('');
  const [isCreatingClinic, setIsCreatingClinic] = useState(false);

  // クリニック一覧取得
  useEffect(() => {
    fetchClinics();
  }, []);

  const fetchClinics = async () => {
    try {
      const response = await fetch('/api/clinics');
      const data = await response.json();
      setClinics(data.clinics || []);

      // 最初のクリニックを自動選択
      if (data.clinics?.length > 0 && !selectedClinic) {
        setSelectedClinic(data.clinics[0]);
      }
    } catch (error) {
      console.error('Error fetching clinics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // SEOスコア詳細取得
  useEffect(() => {
    if (selectedClinic && selectedCategory === 'seo') {
      fetchSEOScore();
    }
  }, [selectedClinic, selectedCategory]);

  const fetchSEOScore = async () => {
    if (!selectedClinic) return;

    try {
      const response = await fetch(`/api/scores/seo?clinicId=${selectedClinic.id}`);
      const data = await response.json();
      setSeoScoreResult(data.latestScore || null);
    } catch (error) {
      console.error('Error fetching SEO score:', error);
    }
  };

  // SEOスコア自動計算
  const handleCalculateSEO = async () => {
    if (!selectedClinic) return;

    setIsCalculating(true);
    try {
      const response = await fetch('/api/scores/seo/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clinicId: selectedClinic.id }),
      });

      if (response.ok) {
        await fetchSEOScore();
        await fetchClinics();
      } else {
        const error = await response.json();
        alert(error.error || 'スコア計算に失敗しました');
      }
    } catch (error) {
      console.error('Error calculating SEO score:', error);
      alert('スコア計算中にエラーが発生しました');
    } finally {
      setIsCalculating(false);
    }
  };

  // SEOスコア手動保存
  const handleSubmitSEOScore = async (scores: Record<string, number>) => {
    if (!selectedClinic) return;

    try {
      const response = await fetch('/api/scores/seo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId: selectedClinic.id,
          scores,
        }),
      });

      if (response.ok) {
        await fetchSEOScore();
        await fetchClinics();
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(error.error || '保存に失敗しました');
      }
    } catch (error) {
      console.error('Error saving SEO score:', error);
      alert('保存中にエラーが発生しました');
    }
  };

  // クリニック作成
  const handleCreateClinic = async () => {
    if (!newClinicName.trim()) {
      alert('医院名を入力してください');
      return;
    }

    setIsCreatingClinic(true);
    try {
      const response = await fetch('/api/clinics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClinicName.trim(),
          website: newClinicWebsite.trim() || null,
        }),
      });

      if (response.ok) {
        await fetchClinics();
        setNewClinicName('');
        setNewClinicWebsite('');
        setShowClinicForm(false);
      } else {
        const error = await response.json();
        alert(error.error || 'クリニック作成に失敗しました');
      }
    } catch (error) {
      console.error('Error creating clinic:', error);
      alert('クリニック作成中にエラーが発生しました');
    } finally {
      setIsCreatingClinic(false);
    }
  };

  // スコアをフラットな形式に変換
  const getScores = (clinic: Clinic) => ({
    homepage: clinic.latestScore?.homepageScore ?? null,
    seo: clinic.latestScore?.seoScore ?? null,
    meo: clinic.latestScore?.meoScore ?? null,
    llmo: clinic.latestScore?.llmoScore ?? null,
    ad: clinic.latestScore?.adScore ?? null,
    sns: clinic.latestScore?.snsScore ?? null,
    review: clinic.latestScore?.reviewScore ?? null,
    offline: clinic.latestScore?.offlineScore ?? null,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  // クリニックがない場合
  if (clinics.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">スコアリングダッシュボード</h1>
          <p className="text-white/60 mt-1">歯科医院のWEBマーケティングを8つの観点から評価</p>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
          <Building className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">医院が登録されていません</h3>
          <p className="text-white/60 mb-6">まずは医院を登録してスコアリングを開始しましょう</p>

          {!showClinicForm ? (
            <button
              onClick={() => setShowClinicForm(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              医院を登録
            </button>
          ) : (
            <div className="max-w-md mx-auto space-y-4 text-left">
              <div>
                <label className="block text-sm font-medium mb-2">医院名 *</label>
                <input
                  type="text"
                  value={newClinicName}
                  onChange={(e) => setNewClinicName(e.target.value)}
                  placeholder="〇〇歯科クリニック"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ウェブサイトURL</label>
                <input
                  type="url"
                  value={newClinicWebsite}
                  onChange={(e) => setNewClinicWebsite(e.target.value)}
                  placeholder="https://example-dental.com"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClinicForm(false)}
                  className="flex-1 px-4 py-2 text-white/60 hover:text-white transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreateClinic}
                  disabled={isCreatingClinic}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 rounded-lg font-medium transition-colors"
                >
                  {isCreatingClinic ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  登録
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          {selectedCategory ? (
            <button
              onClick={() => {
                setSelectedCategory(null);
                setShowForm(false);
              }}
              className="flex items-center gap-2 text-white/60 hover:text-white mb-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              戻る
            </button>
          ) : null}
          <h1 className="text-2xl font-bold">
            {selectedCategory
              ? `${SCORE_CATEGORIES[selectedCategory].nameJa}スコア`
              : 'スコアリングダッシュボード'}
          </h1>
          <p className="text-white/60 mt-1">
            {selectedCategory
              ? `${selectedClinic?.name}の${SCORE_CATEGORIES[selectedCategory].nameJa}評価`
              : '歯科医院のWEBマーケティングを8つの観点から評価'}
          </p>
        </div>

        {/* クリニック選択 */}
        {!selectedCategory && (
          <div className="flex items-center gap-3">
            <select
              value={selectedClinic?.id || ''}
              onChange={(e) => {
                const clinic = clinics.find(c => c.id === e.target.value);
                setSelectedClinic(clinic || null);
              }}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {clinics.map((clinic) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowClinicForm(true)}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
              title="医院を追加"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* クリニック追加モーダル */}
      {showClinicForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-white/10 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">医院を追加</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">医院名 *</label>
                <input
                  type="text"
                  value={newClinicName}
                  onChange={(e) => setNewClinicName(e.target.value)}
                  placeholder="〇〇歯科クリニック"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">ウェブサイトURL</label>
                <input
                  type="url"
                  value={newClinicWebsite}
                  onChange={(e) => setNewClinicWebsite(e.target.value)}
                  placeholder="https://example-dental.com"
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowClinicForm(false);
                    setNewClinicName('');
                    setNewClinicWebsite('');
                  }}
                  className="flex-1 px-4 py-2 text-white/60 hover:text-white transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreateClinic}
                  disabled={isCreatingClinic}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 rounded-lg font-medium transition-colors"
                >
                  {isCreatingClinic ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  登録
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* メインコンテンツ */}
      {selectedClinic && (
        <>
          {/* スコアカードグリッド */}
          {!selectedCategory && (
            <ScoreCardGrid
              scores={getScores(selectedClinic)}
              onCardClick={(category) => setSelectedCategory(category)}
            />
          )}

          {/* SEOスコア詳細 */}
          {selectedCategory === 'seo' && !showForm && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  手動評価
                </button>
              </div>
              <SEOScoreDetail
                scoreResult={seoScoreResult}
                onCalculate={selectedClinic.website ? handleCalculateSEO : undefined}
                isCalculating={isCalculating}
              />
            </div>
          )}

          {/* SEO評価フォーム */}
          {selectedCategory === 'seo' && showForm && (
            <SEOEvaluationForm
              clinicId={selectedClinic.id}
              onSubmit={handleSubmitSEOScore}
              onCancel={() => setShowForm(false)}
            />
          )}

          {/* 他のカテゴリ（未実装） */}
          {selectedCategory && selectedCategory !== 'seo' && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
              <BarChart3 className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {SCORE_CATEGORIES[selectedCategory].nameJa}スコア
              </h3>
              <p className="text-white/60">この機能は現在開発中です</p>
              <p className="text-white/40 text-sm mt-2">SEOスコアを先にお試しください</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
