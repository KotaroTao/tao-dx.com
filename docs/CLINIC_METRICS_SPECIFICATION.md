# クリニックメトリクス・トラッキング機能 仕様書

## 1. 機能概要

### 1.1 目的
歯科医院の日々の経営データ（患者数、新患数、売上など）を記録・蓄積し、経営分析と戦略立案をサポートする機能。

### 1.2 コンセプト
- **簡単入力**: 毎日の入力負荷を最小限に（1分以内で完了）
- **柔軟なカスタマイズ**: 医院ごとに計測項目を自由に追加・編集
- **自動集計**: 日次/週次/月次/年次でデータを自動集計
- **可視化**: グラフやトレンド表示で経営状況を一目で把握
- **目標管理**: 目標値を設定し、達成度を追跡

---

## 2. 機能構成

### 2.1 メインメニュー構成
```
📊 メトリクス
├── 📝 日次入力        # 毎日のデータ入力
├── 📈 ダッシュボード   # 集計・グラフ表示
├── 🎯 目標設定        # 月次・年次目標
├── ⚙️ 項目設定        # カスタム項目の管理
└── 📋 レポート        # CSV/PDFエクスポート
```

---

## 3. データモデル設計

### 3.1 カテゴリ（MetricCategory）
項目を分類するためのカテゴリ。デフォルトカテゴリ＋医院独自カテゴリ。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | String | UUID |
| clinicId | String | 医院ID |
| name | String | カテゴリ名（例：保険診療、自費診療） |
| color | String | 表示色（HEX） |
| icon | String | アイコン名 |
| sortOrder | Int | 表示順序 |
| isDefault | Boolean | デフォルトカテゴリか |
| isActive | Boolean | 有効/無効 |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

**デフォルトカテゴリ:**
1. 保険診療
2. 自費診療（矯正）
3. 自費診療（インプラント）
4. 自費診療（審美）
5. 自費診療（その他）
6. 予防・メンテナンス
7. 物販

### 3.2 計測項目（MetricItem）
各カテゴリ内の具体的な計測項目。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | String | UUID |
| clinicId | String | 医院ID |
| categoryId | String | カテゴリID |
| name | String | 項目名（例：患者数、新患数、売上） |
| type | Enum | 項目タイプ（後述） |
| unit | String | 単位（人、円、件など） |
| description | String? | 説明・メモ |
| sortOrder | Int | 表示順序 |
| isDefault | Boolean | デフォルト項目か |
| isActive | Boolean | 有効/無効 |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

**項目タイプ（MetricType）:**
- `COUNT`: 件数・人数（整数）
- `CURRENCY`: 金額（円）
- `PERCENTAGE`: 割合（%）
- `DURATION`: 時間（分）
- `NUMBER`: その他の数値

**デフォルト項目（各カテゴリ共通）:**
| 項目名 | タイプ | 単位 | 説明 |
|--------|--------|------|------|
| 患者数 | COUNT | 人 | 総患者数（延べ） |
| 新患数 | COUNT | 人 | 初診患者数 |
| 再初診数 | COUNT | 人 | 再初診患者数 |
| キャンセル数 | COUNT | 件 | キャンセル件数 |
| 売上 | CURRENCY | 円 | 売上金額 |
| 自費率 | PERCENTAGE | % | 自費診療比率（自動計算） |

### 3.6 追加推奨項目

#### 経営効率指標
| 項目名 | タイプ | 単位 | 説明 | 入力/自動 |
|--------|--------|------|------|----------|
| ユニット稼働率 | PERCENTAGE | % | チェア稼働時間/営業時間 | 入力 |
| 平均診療単価 | CURRENCY | 円 | 売上/患者数 | 自動計算 |
| 1時間あたり売上 | CURRENCY | 円 | 売上/診療時間 | 自動計算 |
| アポイント消化率 | PERCENTAGE | % | 実来院数/予約数 | 自動計算 |
| 稼働ユニット数 | COUNT | 台 | 当日稼働チェア数 | 入力 |

#### 集患・マーケティング指標
| 項目名 | タイプ | 単位 | 説明 | 入力/自動 |
|--------|--------|------|------|----------|
| 問い合わせ数（電話） | COUNT | 件 | 電話問い合わせ | 入力 |
| 問い合わせ数（Web） | COUNT | 件 | Webフォーム問い合わせ | 入力 |
| 問い合わせ数（LINE） | COUNT | 件 | LINE問い合わせ | 入力 |
| 紹介患者数 | COUNT | 人 | 既存患者からの紹介 | 入力 |
| 初診予約率 | PERCENTAGE | % | 予約数/問い合わせ数 | 自動計算 |

#### 患者管理指標
| 項目名 | タイプ | 単位 | 説明 | 入力/自動 |
|--------|--------|------|------|----------|
| 治療完了数 | COUNT | 人 | 治療計画完了患者数 | 入力 |
| 中断患者数 | COUNT | 人 | 治療中断患者数 | 入力 |
| リコール対象数 | COUNT | 人 | 定期検診案内送付数 | 入力 |
| リコール来院数 | COUNT | 人 | 定期検診来院数 | 入力 |
| リコール率 | PERCENTAGE | % | 来院数/対象数 | 自動計算 |

#### スタッフ・運営指標
| 項目名 | タイプ | 単位 | 説明 | 入力/自動 |
|--------|--------|------|------|----------|
| 出勤スタッフ数（DH） | COUNT | 人 | 歯科衛生士出勤数 | 入力 |
| 出勤スタッフ数（DA） | COUNT | 人 | 歯科助手出勤数 | 入力 |
| 出勤スタッフ数（受付） | COUNT | 人 | 受付スタッフ出勤数 | 入力 |
| 診療時間 | DURATION | 分 | 総診療時間 | 入力 |
| 残業時間 | DURATION | 分 | スタッフ残業合計 | 入力 |
| 平均待ち時間 | DURATION | 分 | 患者平均待ち時間 | 入力 |

### 3.7 問い合わせ経路（InquirySource）
新患の流入経路を追跡するためのモデル。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | String | UUID |
| clinicId | String | 医院ID |
| date | Date | 記録日 |
| source | Enum | 流入経路（後述） |
| count | Int | 件数 |
| newPatientCount | Int | 新患数 |
| revenue | Decimal? | 売上（追跡可能な場合） |
| createdAt | DateTime | 作成日時 |

**流入経路（SourceType）:**
- `WEBSITE`: ホームページ
- `GOOGLE_SEARCH`: Google検索
- `GOOGLE_MAPS`: Googleマップ
- `REFERRAL`: 紹介
- `SIGNAGE`: 看板
- `LEAFLET`: チラシ・DM
- `SNS_INSTAGRAM`: Instagram
- `SNS_LINE`: LINE
- `SNS_OTHER`: その他SNS
- `PORTAL_EPARK`: EPARK
- `PORTAL_OTHER`: その他ポータル
- `WALK_IN`: 飛び込み
- `OTHER`: その他

### 3.8 自動計算指標（DerivedMetric）
他の項目から自動計算される派生指標。

| 指標名 | 計算式 | 説明 |
|--------|--------|------|
| 自費率 | 自費売上 / 総売上 × 100 | 自費診療の比率 |
| 平均単価 | 売上 / 患者数 | 患者1人あたり売上 |
| 新患単価 | 売上 / 新患数 | 新患1人あたり売上 |
| キャンセル率 | キャンセル数 / 予約数 × 100 | 予約キャンセル率 |
| リコール率 | リコール来院数 / リコール対象数 × 100 | 定期検診継続率 |
| 紹介率 | 紹介患者数 / 新患数 × 100 | 口コミ力の指標 |
| 治療完了率 | 完了数 / (完了数 + 中断数) × 100 | 治療継続率 |
| スタッフ1人あたり売上 | 売上 / 出勤スタッフ数 | 生産性指標 |

### 3.3 日次記録（DailyMetric）
毎日入力するデータ本体。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | String | UUID |
| clinicId | String | 医院ID |
| date | Date | 記録日（YYYY-MM-DD） |
| itemId | String | 項目ID |
| value | Decimal | 値 |
| note | String? | メモ・備考 |
| createdBy | String | 入力者ID |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

**ユニーク制約:** (clinicId, date, itemId) で一意

### 3.4 目標（MetricGoal）
月次・年次の目標値。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | String | UUID |
| clinicId | String | 医院ID |
| itemId | String | 項目ID |
| period | Enum | 期間タイプ（MONTHLY, YEARLY） |
| year | Int | 年 |
| month | Int? | 月（月次の場合） |
| targetValue | Decimal | 目標値 |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

### 3.5 集計キャッシュ（MetricSummary）
パフォーマンス向上のための集計済みデータ。

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | String | UUID |
| clinicId | String | 医院ID |
| itemId | String | 項目ID |
| periodType | Enum | DAILY, WEEKLY, MONTHLY, YEARLY |
| periodStart | Date | 期間開始日 |
| periodEnd | Date | 期間終了日 |
| sumValue | Decimal | 合計 |
| avgValue | Decimal | 平均 |
| minValue | Decimal | 最小 |
| maxValue | Decimal | 最大 |
| count | Int | データ件数 |
| updatedAt | DateTime | 更新日時 |

---

## 4. UI/UX設計

### 4.1 日次入力画面

```
┌─────────────────────────────────────────────────────────┐
│  📝 日次メトリクス入力                                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  📅 2024年12月15日（日）  [◀] [▶] [カレンダー]    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─ 🏥 保険診療 ─────────────────────────────────────┐ │
│  │  患者数     [  45  ] 人    新患数    [   3  ] 人  │ │
│  │  再初診数   [   2  ] 人    売上      [380,000] 円 │ │
│  │  キャンセル [   1  ] 件                            │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ 🦷 自費診療（矯正）─────────────────────────────┐  │
│  │  患者数     [   5  ] 人    新患数    [   1  ] 人  │ │
│  │  売上      [850,000] 円                            │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  ┌─ 🔧 自費診療（インプラント）────────────────────┐   │
│  │  患者数     [   2  ] 人    新患数    [   0  ] 人  │ │
│  │  売上      [1,200,000] 円                          │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│  📝 本日のメモ                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ スタッフ1名体調不良で欠勤                         │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [下書き保存]                      [💾 保存して次の日へ] │
└─────────────────────────────────────────────────────────┘
```

**入力UXの工夫:**
- 前日/先週同曜日のデータをプレースホルダー表示
- テンキー対応でスムーズ入力
- Tab/Enterで次フィールドへ移動
- 自動保存機能（入力中断時の復元）
- 未入力日のリマインダー通知

### 4.2 ダッシュボード画面

```
┌─────────────────────────────────────────────────────────┐
│  📈 メトリクスダッシュボード                             │
│  期間: [今月 ▼]  比較: [前月 ▼]  [カスタム期間...]      │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │ 📊 サマリーカード                                   ││
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   ││
│  │ │総患者数  │ │総新患数  │ │総売上    │ │自費率    │   ││
│  │ │   523   │ │    42   │ │12.5M円  │ │  38.2%  │   ││
│  │ │ ▲ +5.2% │ │ ▲ +12% │ │ ▲ +8.5%│ │ ▼ -2.1%│   ││
│  │ └─────────┘ └─────────┘ └─────────┘ └─────────┘   ││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌───────────────────────┐ ┌───────────────────────┐   │
│  │ 📈 日次推移グラフ       │ │ 🎯 目標達成率         │   │
│  │ [患者数][売上][新患数]  │ │                       │   │
│  │     📈               │ │  売上 ████████░░ 82%  │   │
│  │   📈   📈           │ │  新患 ██████░░░░ 65%  │   │
│  │ 📈       📈 📈      │ │  自費率 ████░░░░░ 42% │   │
│  │  1  5  10  15  20    │ │                       │   │
│  └───────────────────────┘ └───────────────────────┘   │
│                                                         │
│  ┌───────────────────────┐ ┌───────────────────────┐   │
│  │ 🥧 カテゴリ別売上構成    │ │ 📊 曜日別患者数        │   │
│  │    ┌────────┐         │ │ 月 ████████          │   │
│  │   ╱  保険   ╲        │ │ 火 ██████████        │   │
│  │  │  45%    │        │ │ 水 ████              │   │
│  │  │ 矯正25% │        │ │ 木 ████████████      │   │
│  │   ╲ インプラ20% ╱    │ │ 金 ██████████        │   │
│  │    ╲ 審美10%╱        │ │ 土 ████████████████  │   │
│  └───────────────────────┘ └───────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 4.3 項目設定画面

```
┌─────────────────────────────────────────────────────────┐
│  ⚙️ 計測項目の設定                                       │
│                                                         │
│  カテゴリ                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 🔵 保険診療           [編集] [↑] [↓]           │   │
│  │ 🟢 自費診療（矯正）    [編集] [↑] [↓]           │   │
│  │ 🟡 自費診療（インプラント） [編集] [↑] [↓]       │   │
│  │ 🟣 自費診療（審美）    [編集] [↑] [↓]           │   │
│  │ 🟠 予防・メンテナンス  [編集] [↑] [↓]           │   │
│  │ 🔴 物販               [編集] [↑] [↓]           │   │
│  │ ➕ 新しいカテゴリを追加                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  項目（保険診療）                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☑️ 患者数     COUNT    人  [編集] [↑] [↓]      │   │
│  │ ☑️ 新患数     COUNT    人  [編集] [↑] [↓]      │   │
│  │ ☑️ 再初診数   COUNT    人  [編集] [↑] [↓]      │   │
│  │ ☑️ キャンセル COUNT    件  [編集] [↑] [↓]      │   │
│  │ ☑️ 売上       CURRENCY 円  [編集] [↑] [↓]      │   │
│  │ ☐ 診療時間   DURATION  分  [編集] [↑] [↓]      │   │
│  │ ➕ 新しい項目を追加                              │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 4.4 目標設定画面

```
┌─────────────────────────────────────────────────────────┐
│  🎯 目標設定                                            │
│  [2024年 ▼]                                            │
│                                                         │
│  年間目標                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 総売上     目標: 150,000,000円  現在: 125,000,000円 │ │
│  │ ████████████████░░░░ 83.3%                        │ │
│  │                                                   │ │
│  │ 総新患数   目標: 600人          現在: 485人        │ │
│  │ ████████████████░░░░ 80.8%                        │ │
│  │                                                   │ │
│  │ 自費率     目標: 40%            現在: 38.2%        │ │
│  │ ███████████████████░ 95.5%                        │ │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  月別目標                                               │
│  ┌────────────────────────────────────────────────────┐│
│  │     │ 売上目標    │ 売上実績   │ 達成率 │ 新患目標 ││
│  │ 1月 │ 12,000,000 │ 11,500,000│  95.8% │    50   ││
│  │ 2月 │ 11,000,000 │ 10,800,000│  98.2% │    45   ││
│  │ ... │            │           │        │         ││
│  │12月 │ 14,000,000 │ (未入力)  │   -    │    55   ││
│  └────────────────────────────────────────────────────┘│
│                                                         │
│  [📥 前年実績からインポート]  [💾 目標を保存]            │
└─────────────────────────────────────────────────────────┘
```

---

## 5. API設計

### 5.1 エンドポイント一覧

| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/metrics/categories | カテゴリ一覧取得 |
| POST | /api/metrics/categories | カテゴリ作成 |
| PUT | /api/metrics/categories/[id] | カテゴリ更新 |
| DELETE | /api/metrics/categories/[id] | カテゴリ削除 |
| GET | /api/metrics/items | 項目一覧取得 |
| POST | /api/metrics/items | 項目作成 |
| PUT | /api/metrics/items/[id] | 項目更新 |
| DELETE | /api/metrics/items/[id] | 項目削除 |
| GET | /api/metrics/daily | 日次データ取得 |
| POST | /api/metrics/daily | 日次データ保存（一括） |
| PUT | /api/metrics/daily/[id] | 日次データ更新 |
| GET | /api/metrics/summary | 集計データ取得 |
| GET | /api/metrics/goals | 目標一覧取得 |
| POST | /api/metrics/goals | 目標設定 |
| PUT | /api/metrics/goals/[id] | 目標更新 |
| GET | /api/metrics/export | CSV/PDFエクスポート |

### 5.2 リクエスト/レスポンス例

**日次データ保存 (POST /api/metrics/daily)**
```json
{
  "clinicId": "clinic_xxx",
  "date": "2024-12-15",
  "entries": [
    { "itemId": "item_001", "value": 45, "note": null },
    { "itemId": "item_002", "value": 3, "note": null },
    { "itemId": "item_005", "value": 380000, "note": null }
  ],
  "dailyNote": "スタッフ1名体調不良で欠勤"
}
```

**集計データ取得 (GET /api/metrics/summary)**
```
GET /api/metrics/summary?clinicId=xxx&periodType=MONTHLY&year=2024&month=12
```
```json
{
  "period": {
    "type": "MONTHLY",
    "start": "2024-12-01",
    "end": "2024-12-31"
  },
  "summary": {
    "totalPatients": 523,
    "totalNewPatients": 42,
    "totalRevenue": 12500000,
    "selfPayRatio": 38.2
  },
  "byCategory": [
    {
      "categoryId": "cat_001",
      "categoryName": "保険診療",
      "patients": 320,
      "revenue": 4500000
    }
  ],
  "comparison": {
    "previousPeriod": "2024-11",
    "patientChange": 5.2,
    "revenueChange": 8.5
  },
  "goals": {
    "revenue": { "target": 15000000, "actual": 12500000, "rate": 83.3 }
  }
}
```

---

## 6. 実装優先度

### Phase 1: MVP（最小限の機能）
1. ✅ データベーススキーマ作成
2. ✅ デフォルトカテゴリ・項目のシード
3. ✅ 日次入力画面
4. ✅ 日次データのCRUD API
5. ✅ 基本的なダッシュボード（今月の集計）

### Phase 2: 拡張機能
1. 📊 グラフ・チャート表示
2. 🎯 目標設定機能
3. 📅 カレンダービュー
4. 📧 未入力リマインダー（メール/LINE通知）

### Phase 3: 高度な分析
1. 🤖 AI分析・予測（トレンド予測）
2. 📋 カスタムレポート生成
3. 📥 CSV/PDFエクスポート
4. 📊 前年同月比較
5. 🔔 目標未達アラート

### Phase 4: 連携機能
1. 🔗 レセコン連携（自動データ取込）
2. 📱 LINE公式アカウント連携
3. 📊 Google Spreadsheet連携

---

## 7. 技術的考慮事項

### 7.1 パフォーマンス
- 日次データは増加するため、インデックス設計が重要
- 集計データはキャッシュ（MetricSummary）を活用
- 大量データのエクスポートは非同期処理

### 7.2 セキュリティ
- 医院ごとのデータ分離（clinicId + userIdで認可）
- 機密性の高い売上データの適切なアクセス制御
- 監査ログの記録

### 7.3 データ整合性
- 日次データは日付+項目で一意制約
- 削除は論理削除（isActive=false）を基本
- 過去データの改ざん防止（監査ログ）

---

## 8. 追加機能詳細

### 8.1 曜日・時間帯分析機能

患者数・売上を曜日・時間帯別に可視化し、予約枠の最適化をサポート。

```
┌─────────────────────────────────────────────────────────┐
│  📅 曜日別・時間帯別ヒートマップ                         │
│                                                         │
│        9時  10時  11時  12時  14時  15時  16時  17時     │
│  月    🟢   🟡    🟢    ⚪    🟡    🟢    🟢    🟡       │
│  火    🟢   🟢    🔴    ⚪    🟢    🔴    🔴    🟢       │
│  水    休診                                              │
│  木    🟢   🟢    🟢    ⚪    🔴    🔴    🔴    🟢       │
│  金    🟡   🟢    🟢    ⚪    🟢    🟢    🟡    🟡       │
│  土    🔴   🔴    🔴    🔴    🔴    🔴    -     -        │
│                                                         │
│  🔴 混雑（稼働率90%以上）  🟢 適正（60-89%）              │
│  🟡 余裕（40-59%）         ⚪ 休憩・空き                  │
│                                                         │
│  💡 改善提案:                                            │
│  • 土曜午前の需要が高い。予約枠の拡大を検討              │
│  • 月曜午後は空きが多い。キャンペーン実施を推奨          │
└─────────────────────────────────────────────────────────┘
```

### 8.2 アラート・通知機能

重要な指標の変動を自動検知し、通知。

```typescript
// アラート設定例
const alertSettings = [
  {
    id: 'new_patient_drop',
    name: '新患数低下アラート',
    condition: '今週の新患数 < 先週の新患数 × 0.7',
    severity: 'warning',
    notification: ['LINE', 'EMAIL'],
  },
  {
    id: 'goal_warning',
    name: '目標未達警告',
    condition: '月半ばで目標達成率 < 40%',
    severity: 'warning',
    notification: ['APP'],
  },
  {
    id: 'cancel_rate_high',
    name: 'キャンセル率上昇',
    condition: 'キャンセル率 > 15%',
    severity: 'alert',
    notification: ['LINE', 'EMAIL'],
  },
  {
    id: 'daily_input_reminder',
    name: '入力リマインダー',
    condition: '前日のデータ未入力',
    timing: '翌朝9時',
    notification: ['LINE'],
  },
  {
    id: 'revenue_milestone',
    name: '売上マイルストーン達成',
    condition: '月間売上が目標の80%を達成',
    severity: 'success',
    notification: ['APP'],
  },
];
```

**通知チャネル:**
| チャネル | 用途 | 優先度 |
|---------|------|-------|
| LINE公式 | 日次リマインダー、重要アラート | 高 |
| メール | 週次/月次レポート、アラート | 中 |
| アプリ内通知 | 全般 | 中 |
| Slack/Chatwork | チーム共有 | 低 |

### 8.3 比較分析機能

```
┌─────────────────────────────────────────────────────────┐
│  📊 比較分析                                            │
│                                                         │
│  期間: [2024年12月 ▼]                                   │
│  比較対象: ☑️ 前月  ☑️ 前年同月  ☑️ 目標                │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 指標         今月      前月     前年同月    目標   │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ 総売上      12.5M    11.8M     11.2M     15.0M  │  │
│  │ 変化率       -       +5.9%    +11.6%    83.3%  │  │
│  │                                                  │  │
│  │ 総患者数     523      497       480       600   │  │
│  │ 変化率       -       +5.2%     +9.0%    87.2%  │  │
│  │                                                  │  │
│  │ 新患数        42       38        35        50   │  │
│  │ 変化率       -      +10.5%    +20.0%    84.0%  │  │
│  │                                                  │  │
│  │ 自費率      38.2%    39.5%     35.0%     40%   │  │
│  │ 変化率       -       -1.3pt    +3.2pt   95.5%  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  📈 トレンドグラフ（過去12ヶ月）                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │    売上推移                                       │  │
│  │ 15M ┤                                    ┌──目標  │  │
│  │     │                              ╱─────╯       │  │
│  │ 12M ┤                    ╱─────────╯              │  │
│  │     │          ╱────────╯                         │  │
│  │ 10M ┤─────────╯                                   │  │
│  │     └──────────────────────────────────────────   │  │
│  │      1月  3月  5月  7月  9月  11月                │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 8.4 AI予測・トレンド分析機能

```
┌─────────────────────────────────────────────────────────┐
│  🤖 AI経営分析レポート                                   │
│                                                         │
│  📈 来月の予測                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 総売上予測: 13,200,000円（±5%）                   │   │
│  │ 根拠: 過去12ヶ月のトレンド + 季節性 + 曜日構成    │   │
│  │                                                   │   │
│  │ 新患数予測: 45人（±3人）                          │   │
│  │ 根拠: 過去の傾向 + 年末年始の影響考慮             │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ⚠️ 注意点                                              │
│  ┌─────────────────────────────────────────────────┐   │
│  │ • 水曜休診が5回あるため、通常月より稼働日が1日少ない│   │
│  │ • 例年12月後半は予約が減少傾向                    │   │
│  │ • 年末年始休暇を考慮すると実質20日稼働            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  💡 改善提案                                             │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 1. 矯正相談が増加傾向（前年比+15%）                │   │
│  │    → 相談→契約の転換率向上で月間売上+50万円の可能性│   │
│  │                                                   │   │
│  │ 2. 土曜午後の稼働率が低い（平均55%）              │   │
│  │    → 予約枠の見直し、または午後休診の検討         │   │
│  │                                                   │   │
│  │ 3. リコール率が低下傾向（3ヶ月前比-5pt）          │   │
│  │    → リマインド方法の見直しを推奨                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🎯 目標達成のためのアクション                           │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 年間売上目標150Mの達成には、残り2ヶ月で25Mが必要   │   │
│  │ • 月間平均12.5Mを維持すれば達成可能                │   │
│  │ • 自費率を現在の38%→42%に上げると+200万円/月      │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 8.5 モバイル対応（スマホ入力）

```
┌────────────────────┐    ┌────────────────────┐
│  📱 今日の入力      │    │  📱 クイック入力    │
│  2024/12/15（日）   │    │                    │
│                    │    │  🎤 音声入力        │
│  🏥 保険診療        │    │  「保険診療         │
│  患者数  [  45  ]  │    │   患者45人          │
│  新患数  [   3  ]  │    │   新患3人           │
│  売上   [380,000]  │    │   売上38万円」      │
│                    │    │                    │
│  🦷 矯正            │    │  [認識結果を確認]   │
│  患者数  [   5  ]  │    │                    │
│  売上   [850,000]  │    │  ✓ 保険: 45人/3人  │
│                    │    │  ✓ 売上: 380,000円 │
│  [全カテゴリ表示]   │    │                    │
│                    │    │  [修正] [保存]      │
│  [保存]            │    │                    │
└────────────────────┘    └────────────────────┘
```

**モバイル機能:**
- レスポンシブデザイン（PWA対応）
- オフライン入力対応（後で同期）
- 音声入力サポート
- ウィジェット対応（iOS/Android）
- プッシュ通知

### 8.6 複数医院対応（法人向け）

```
┌─────────────────────────────────────────────────────────┐
│  🏢 法人ダッシュボード                                   │
│  医療法人○○会（3医院）                                  │
│                                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │法人合計売上│ │法人合計患者│ │平均単価  │ │平均自費率│      │
│  │  38.5M   │ │  1,520  │ │ 25,329  │ │  42.1%  │      │
│  │ ▲+6.2%  │ │ ▲+4.8% │ │ ▲+1.3% │ │ ▲+0.8pt│      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                         │
│  📊 医院別比較                                           │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 医院名        売上      患者数    自費率   達成率 │  │
│  ├──────────────────────────────────────────────────┤  │
│  │ ○○歯科本院   15.2M      620     45.2%    95%  │  │
│  │              ▲+8%     ▲+5%    ▲+2pt          │  │
│  │ ○○歯科分院   12.8M      510     41.5%    88%  │  │
│  │              ▲+5%     ▲+3%    ▼-1pt          │  │
│  │ △△デンタル   10.5M      390     38.8%    75%  │  │
│  │              ▲+4%     ▲+6%    ▲+1pt          │  │
│  └──────────────────────────────────────────────────┘  │
│                                                         │
│  🏆 医院間ランキング                                     │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 新患獲得率    1位: 本院(8.2%)  2位: 分院(7.8%)    │  │
│  │ 自費率        1位: 本院(45.2%) 2位: 分院(41.5%)   │  │
│  │ リコール率    1位: 分院(78%)   2位: △△(72%)      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**法人向け機能:**
- 医院横断ダッシュボード
- 医院間ベンチマーク
- 権限管理（本部/医院管理者/スタッフ）
- 統合レポート生成
- 医院グループ設定

### 8.7 外部連携機能

| 連携先 | 連携内容 | 優先度 | 実装難易度 |
|-------|---------|-------|-----------|
| **レセコン** | 患者数・売上の自動取込 | 高 | 高 |
| **予約システム** | 予約数・キャンセル数の自動取込 | 高 | 中 |
| **Google スプレッドシート** | データのエクスポート・共有 | 中 | 低 |
| **会計ソフト（freee/MFクラウド）** | 売上データ連携 | 中 | 中 |
| **LINE公式アカウント** | リマインダー・レポート配信 | 中 | 低 |
| **Slack/Chatwork** | チーム通知・共有 | 低 | 低 |
| **Googleカレンダー** | 休診日の自動反映 | 低 | 低 |

### 8.8 レポート自動生成機能

```
┌─────────────────────────────────────────────────────────┐
│  📋 レポート生成                                         │
│                                                         │
│  レポート種類                                            │
│  ┌─────────────────────────────────────────────────┐   │
│  │ ☐ 日次レポート（前日実績サマリー）                │   │
│  │ ☑️ 週次レポート（週間実績 + 前週比較）            │   │
│  │ ☑️ 月次レポート（月間実績 + 前月/前年比較）       │   │
│  │ ☐ 四半期レポート（3ヶ月実績 + トレンド分析）      │   │
│  │ ☐ 年次レポート（年間実績 + 来年予測）            │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  配信設定                                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 配信先: [院長 ▼] [経理担当 ▼] [+ 追加]           │   │
│  │ 配信方法: ☑️ メール  ☑️ LINE  ☐ Slack           │   │
│  │ 配信タイミング: [毎週月曜 9:00 ▼]                │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  エクスポート形式                                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │ [📄 PDF] [📊 Excel] [📑 CSV] [🔗 Googleスプレッド]│   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [プレビュー]                      [💾 設定を保存]       │
└─────────────────────────────────────────────────────────┘
```

**レポート内容:**
- 経営サマリー（売上・患者数・自費率）
- 目標達成状況
- カテゴリ別内訳
- 前期比較（前月/前年）
- トレンドグラフ
- AI分析コメント
- 改善提案

---

## 9. 将来の拡張案

### 9.1 高度なAI分析機能
- 売上トレンド予測（機械学習）
- 患者離脱リスク予測
- 最適なスタッフ配置提案
- 季節変動の自動検知
- 異常値アラート（急な変動）

### 9.2 ベンチマーク機能
- 業界平均との比較
- 地域内の匿名比較（同規模医院）
- 医院規模別ランキング
- 改善ポイントの自動提案

### 9.3 患者分析連携
- 患者層分析（年代・性別）
- LTV（生涯顧客価値）計算
- コホート分析（継続率）
- ABC分析（売上貢献度）

### 9.4 スタッフパフォーマンス
- スタッフ別生産性
- 担当患者数の可視化
- 目標設定・達成管理
- インセンティブ計算

---

## 9. 画面遷移図

```
サイドバー
    │
    ├── 📊 メトリクス ─────────────┐
    │       │                     │
    │       ├── 📝 日次入力 ◄─────┤
    │       │       │             │
    │       │       └── 日付選択 ──┘
    │       │
    │       ├── 📈 ダッシュボード
    │       │       │
    │       │       ├── 期間選択
    │       │       ├── グラフ表示
    │       │       └── 詳細ドリルダウン
    │       │
    │       ├── 🎯 目標設定
    │       │       │
    │       │       ├── 年間目標
    │       │       └── 月別目標
    │       │
    │       ├── ⚙️ 項目設定
    │       │       │
    │       │       ├── カテゴリ管理
    │       │       └── 項目管理
    │       │
    │       └── 📋 レポート
    │               │
    │               ├── レポート生成
    │               └── エクスポート
```

---

## 10. 成功指標（KPI）

| 指標 | 目標値 | 測定方法 |
|------|-------|---------|
| 日次入力完了率 | 90%以上 | 入力日数/営業日数 |
| 入力所要時間 | 60秒以内 | 入力開始〜保存の時間 |
| ダッシュボード閲覧頻度 | 週3回以上 | ログイン・閲覧ログ |
| 目標達成率向上 | 前年比+10% | 目標達成率の変化 |

---

## 11. Prismaスキーマ追加案

以下のモデルを `prisma/schema.prisma` に追加する。

```prisma
// ============================================
// クリニックメトリクス・トラッキングシステム
// ============================================

// メトリクスカテゴリ（保険診療、自費診療など）
model MetricCategory {
  id          String       @id @default(cuid())
  clinicId    String
  clinic      Clinic       @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  name        String       // カテゴリ名
  color       String       @default("#6366f1") // 表示色
  icon        String?      // アイコン名（lucide-react）
  sortOrder   Int          @default(0)
  isDefault   Boolean      @default(false) // デフォルトカテゴリか
  isActive    Boolean      @default(true)
  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  // リレーション
  items       MetricItem[]

  @@unique([clinicId, name])
  @@index([clinicId])
  @@index([sortOrder])
}

// 計測項目タイプ
enum MetricType {
  COUNT       // 件数・人数（整数）
  CURRENCY    // 金額（円）
  PERCENTAGE  // 割合（%）
  DURATION    // 時間（分）
  NUMBER      // その他の数値
}

// 計測項目（患者数、新患数、売上など）
model MetricItem {
  id          String         @id @default(cuid())
  clinicId    String
  categoryId  String
  category    MetricCategory @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  name        String         // 項目名
  type        MetricType     @default(COUNT)
  unit        String         @default("") // 単位
  description String?        // 説明
  sortOrder   Int            @default(0)
  isDefault   Boolean        @default(false)
  isActive    Boolean        @default(true)
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt

  // リレーション
  dailyMetrics DailyMetric[]
  goals        MetricGoal[]
  summaries    MetricSummary[]

  @@unique([categoryId, name])
  @@index([clinicId])
  @@index([categoryId])
  @@index([sortOrder])
}

// 日次メトリクス記録
model DailyMetric {
  id          String     @id @default(cuid())
  clinicId    String
  date        DateTime   @db.Date // 記録日
  itemId      String
  item        MetricItem @relation(fields: [itemId], references: [id], onDelete: Cascade)
  value       Decimal    @db.Decimal(15, 2) // 値
  note        String?    // メモ
  createdBy   String     // 入力者ID
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@unique([clinicId, date, itemId])
  @@index([clinicId])
  @@index([date])
  @@index([itemId])
}

// 日次メモ（その日全体のメモ）
model DailyNote {
  id          String   @id @default(cuid())
  clinicId    String
  date        DateTime @db.Date
  note        String   @db.Text
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([clinicId, date])
  @@index([clinicId])
  @@index([date])
}

// 目標期間タイプ
enum GoalPeriod {
  MONTHLY
  YEARLY
}

// 目標設定
model MetricGoal {
  id          String     @id @default(cuid())
  clinicId    String
  itemId      String
  item        MetricItem @relation(fields: [itemId], references: [id], onDelete: Cascade)
  period      GoalPeriod
  year        Int
  month       Int?       // 月次目標の場合のみ
  targetValue Decimal    @db.Decimal(15, 2)
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  @@unique([clinicId, itemId, period, year, month])
  @@index([clinicId])
  @@index([itemId])
  @@index([year])
}

// 集計期間タイプ
enum SummaryPeriod {
  DAILY
  WEEKLY
  MONTHLY
  YEARLY
}

// 集計キャッシュ
model MetricSummary {
  id          String        @id @default(cuid())
  clinicId    String
  itemId      String
  item        MetricItem    @relation(fields: [itemId], references: [id], onDelete: Cascade)
  periodType  SummaryPeriod
  periodStart DateTime      @db.Date
  periodEnd   DateTime      @db.Date
  sumValue    Decimal       @db.Decimal(15, 2) // 合計
  avgValue    Decimal       @db.Decimal(15, 2) // 平均
  minValue    Decimal       @db.Decimal(15, 2) // 最小
  maxValue    Decimal       @db.Decimal(15, 2) // 最大
  count       Int           // データ件数
  updatedAt   DateTime      @updatedAt

  @@unique([clinicId, itemId, periodType, periodStart])
  @@index([clinicId])
  @@index([itemId])
  @@index([periodType])
  @@index([periodStart])
}

// ============================================
// 問い合わせ経路トラッキング
// ============================================

// 流入経路タイプ
enum SourceType {
  WEBSITE         // ホームページ
  GOOGLE_SEARCH   // Google検索
  GOOGLE_MAPS     // Googleマップ
  REFERRAL        // 紹介
  SIGNAGE         // 看板
  LEAFLET         // チラシ・DM
  SNS_INSTAGRAM   // Instagram
  SNS_LINE        // LINE
  SNS_OTHER       // その他SNS
  PORTAL_EPARK    // EPARK
  PORTAL_OTHER    // その他ポータル
  WALK_IN         // 飛び込み
  OTHER           // その他
}

// 問い合わせ経路記録
model InquirySource {
  id              String     @id @default(cuid())
  clinicId        String
  date            DateTime   @db.Date
  source          SourceType
  inquiryCount    Int        @default(0) // 問い合わせ数
  newPatientCount Int        @default(0) // 新患数
  revenue         Decimal?   @db.Decimal(15, 2) // 売上（追跡可能な場合）
  note            String?
  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  @@unique([clinicId, date, source])
  @@index([clinicId])
  @@index([date])
  @@index([source])
}

// ============================================
// アラート・通知機能
// ============================================

// アラート重要度
enum AlertSeverity {
  INFO      // 情報
  SUCCESS   // 成功
  WARNING   // 警告
  ALERT     // 緊急
}

// 通知チャネル
enum NotificationChannel {
  APP       // アプリ内通知
  EMAIL     // メール
  LINE      // LINE
  SLACK     // Slack
}

// アラート設定
model AlertSetting {
  id              String               @id @default(cuid())
  clinicId        String
  name            String               // アラート名
  description     String?              // 説明
  conditionType   String               // 条件タイプ（new_patient_drop, goal_warning, etc.）
  conditionValue  Json                 // 条件値（JSON）
  severity        AlertSeverity        @default(WARNING)
  channels        NotificationChannel[]
  isActive        Boolean              @default(true)
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  @@index([clinicId])
  @@index([conditionType])
}

// アラート履歴
model AlertHistory {
  id              String         @id @default(cuid())
  clinicId        String
  alertSettingId  String?
  title           String
  message         String         @db.Text
  severity        AlertSeverity
  data            Json?          // アラート発生時のデータ
  isRead          Boolean        @default(false)
  readAt          DateTime?
  createdAt       DateTime       @default(now())

  @@index([clinicId])
  @@index([createdAt])
  @@index([isRead])
}

// ============================================
// レポート設定
// ============================================

// レポートタイプ
enum ReportType {
  DAILY       // 日次
  WEEKLY      // 週次
  MONTHLY     // 月次
  QUARTERLY   // 四半期
  YEARLY      // 年次
}

// レポート配信設定
model ReportSetting {
  id              String               @id @default(cuid())
  clinicId        String
  reportType      ReportType
  isEnabled       Boolean              @default(true)
  channels        NotificationChannel[]
  recipients      String[]             // 配信先ユーザーID
  scheduleCron    String?              // cronスケジュール
  lastSentAt      DateTime?
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt

  @@unique([clinicId, reportType])
  @@index([clinicId])
}
```

### Clinicモデルへのリレーション追加

```prisma
model Clinic {
  // ... 既存フィールド ...

  // メトリクス関連リレーション追加
  metricCategories MetricCategory[]
  dailyNotes       DailyNote[]
  inquirySources   InquirySource[]
  alertSettings    AlertSetting[]
  alertHistory     AlertHistory[]
  reportSettings   ReportSetting[]
}
```

---

## 12. デフォルトデータ（シード）

新規医院登録時に自動作成されるデフォルトカテゴリ・項目:

```typescript
const defaultCategories = [
  {
    name: '保険診療',
    color: '#3b82f6', // blue
    icon: 'Shield',
    items: [
      { name: '患者数', type: 'COUNT', unit: '人' },
      { name: '新患数', type: 'COUNT', unit: '人' },
      { name: '再初診数', type: 'COUNT', unit: '人' },
      { name: 'キャンセル数', type: 'COUNT', unit: '件' },
      { name: '売上', type: 'CURRENCY', unit: '円' },
    ],
  },
  {
    name: '自費診療（矯正）',
    color: '#8b5cf6', // purple
    icon: 'Smile',
    items: [
      { name: '患者数', type: 'COUNT', unit: '人' },
      { name: '新患数', type: 'COUNT', unit: '人' },
      { name: '相談件数', type: 'COUNT', unit: '件' },
      { name: '契約件数', type: 'COUNT', unit: '件' },
      { name: '売上', type: 'CURRENCY', unit: '円' },
    ],
  },
  {
    name: '自費診療（インプラント）',
    color: '#f59e0b', // amber
    icon: 'CircleDot',
    items: [
      { name: '患者数', type: 'COUNT', unit: '人' },
      { name: '新患数', type: 'COUNT', unit: '人' },
      { name: '相談件数', type: 'COUNT', unit: '件' },
      { name: '手術件数', type: 'COUNT', unit: '件' },
      { name: '売上', type: 'CURRENCY', unit: '円' },
    ],
  },
  {
    name: '自費診療（審美）',
    color: '#ec4899', // pink
    icon: 'Sparkles',
    items: [
      { name: '患者数', type: 'COUNT', unit: '人' },
      { name: 'ホワイトニング件数', type: 'COUNT', unit: '件' },
      { name: 'セラミック件数', type: 'COUNT', unit: '件' },
      { name: '売上', type: 'CURRENCY', unit: '円' },
    ],
  },
  {
    name: '予防・メンテナンス',
    color: '#10b981', // emerald
    icon: 'HeartPulse',
    items: [
      { name: '患者数', type: 'COUNT', unit: '人' },
      { name: '新患数', type: 'COUNT', unit: '人' },
      { name: 'リコール来院数', type: 'COUNT', unit: '人' },
      { name: 'リコール率', type: 'PERCENTAGE', unit: '%' },
      { name: '売上', type: 'CURRENCY', unit: '円' },
    ],
  },
  {
    name: '物販',
    color: '#f97316', // orange
    icon: 'ShoppingBag',
    items: [
      { name: '販売件数', type: 'COUNT', unit: '件' },
      { name: '売上', type: 'CURRENCY', unit: '円' },
    ],
  },
];
```

---

## 13. ファイル構成案

```
src/
├── app/
│   ├── (dashboard)/
│   │   └── metrics/
│   │       ├── page.tsx              # メトリクスメインページ（リダイレクト）
│   │       ├── daily/
│   │       │   └── page.tsx          # 日次入力画面
│   │       ├── dashboard/
│   │       │   └── page.tsx          # ダッシュボード
│   │       ├── goals/
│   │       │   └── page.tsx          # 目標設定
│   │       ├── settings/
│   │       │   └── page.tsx          # 項目設定
│   │       └── reports/
│   │           └── page.tsx          # レポート
│   └── api/
│       └── metrics/
│           ├── categories/
│           │   ├── route.ts          # GET, POST
│           │   └── [id]/route.ts     # PUT, DELETE
│           ├── items/
│           │   ├── route.ts          # GET, POST
│           │   └── [id]/route.ts     # PUT, DELETE
│           ├── daily/
│           │   └── route.ts          # GET, POST
│           ├── summary/
│           │   └── route.ts          # GET
│           ├── goals/
│           │   ├── route.ts          # GET, POST
│           │   └── [id]/route.ts     # PUT, DELETE
│           └── export/
│               └── route.ts          # GET (CSV/PDF)
└── components/
    └── metrics/
        ├── DailyInputForm.tsx        # 日次入力フォーム
        ├── MetricCard.tsx            # サマリーカード
        ├── MetricChart.tsx           # グラフコンポーネント
        ├── GoalProgress.tsx          # 目標達成率表示
        ├── CategoryManager.tsx       # カテゴリ管理
        └── ItemManager.tsx           # 項目管理
```

---

*作成日: 2024年12月15日*
*最終更新: 2024年12月15日*
*作成者: TAO Marketing System Team*
