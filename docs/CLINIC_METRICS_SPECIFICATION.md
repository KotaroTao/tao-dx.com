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

## 8. 将来の拡張案

### 8.1 AI分析機能
- 売上トレンド予測
- 最適な患者数予測
- 曜日・季節別の傾向分析
- 異常値検知（急な患者減少など）

### 8.2 ベンチマーク機能
- 業界平均との比較
- 地域内の匿名比較
- 医院規模別の比較

### 8.3 レポート自動生成
- 月次経営レポートのPDF自動生成
- オーナー向けサマリーメール
- 税理士向けデータエクスポート

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
```

### Clinicモデルへのリレーション追加

```prisma
model Clinic {
  // ... 既存フィールド ...

  // メトリクス関連リレーション追加
  metricCategories MetricCategory[]
  dailyNotes       DailyNote[]
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
