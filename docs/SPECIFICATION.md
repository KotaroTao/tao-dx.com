# T.A.O Marketing System 仕様書

**バージョン**: 1.0.0
**最終更新日**: 2026-01-01
**開発者**: 田尾耕太郎

---

## 1. システム概要

### 1.1 コンセプト

T.A.O Marketing Systemは、マーケティング業務を効率化するためのWEBアプリケーションです。

- **T**hink（考える）：データに基づいた戦略立案
- **A**ct（動く）：効率的な実行と自動化
- **O**ptimize（改善する）：継続的な改善サイクル

### 1.2 対象ユーザー

- マーケティング担当者
- 経営者・事業責任者
- コンテンツクリエイター

### 1.3 技術スタック

| 分類 | 技術 |
|------|------|
| フロントエンド | Next.js 14 (App Router), React, TypeScript |
| バックエンド | Next.js API Routes |
| データベース | PostgreSQL |
| ORM | Prisma |
| 認証 | NextAuth.js (Credentials Provider) |
| スタイリング | Tailwind CSS |
| インフラ | Coolify (VPS), Docker |

---

## 2. 機能一覧

### 2.1 Phase 1 - MVP（最小限の製品）

#### 2.1.1 認証機能
- ログイン / ログアウト
- セッション管理
- パスワード認証

#### 2.1.2 ダッシュボード
- KPI概要表示
- 最近のアクティビティ
- クイックアクション

#### 2.1.3 顧客管理（CRM基本機能）
- 顧客情報の登録・編集・削除
- 顧客一覧表示（検索・フィルター）
- 顧客詳細ページ

#### 2.1.4 タスク管理
- タスクの作成・編集・削除
- ステータス管理（未着手・進行中・完了）
- 期限設定・アラート

### 2.2 Phase 2 - 機能拡張

#### 2.2.1 キャンペーン管理
- キャンペーンの作成・管理
- 予算・期間設定
- 成果トラッキング

#### 2.2.2 コンテンツカレンダー
- SNS投稿スケジュール管理
- コンテンツの下書き保存
- カレンダービュー

#### 2.2.3 レポート機能
- 月次レポート自動生成
- データ可視化（チャート）
- PDF/CSVエクスポート

### 2.3 Phase 3 - 高度な機能

#### 2.3.1 アナリティクス連携
- Google Analytics連携
- SNSインサイト連携
- 統合ダッシュボード

#### 2.3.2 自動化機能
- メール自動送信
- リマインダー通知
- ワークフロー自動化

---

## 3. データモデル

### 3.1 ER図（概念）

```
User
├── Customer (1:N)
├── Task (1:N)
├── Campaign (1:N)
└── Content (1:N)

Customer
├── Task (1:N)
└── Campaign (M:N)

Campaign
├── Task (1:N)
└── Content (1:N)
```

### 3.2 主要エンティティ

#### User（ユーザー）
| フィールド | 型 | 説明 |
|-----------|------|------|
| id | String | 主キー（CUID） |
| email | String | メールアドレス（ユニーク） |
| name | String | ユーザー名 |
| password | String | ハッシュ化パスワード |
| role | Enum | 権限（ADMIN, USER） |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

#### Customer（顧客）
| フィールド | 型 | 説明 |
|-----------|------|------|
| id | String | 主キー（CUID） |
| name | String | 顧客名 |
| email | String | メールアドレス |
| phone | String | 電話番号 |
| company | String | 会社名 |
| status | Enum | ステータス（LEAD, PROSPECT, CUSTOMER, CHURNED） |
| notes | Text | メモ |
| userId | String | 担当者ID（外部キー） |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

#### Task（タスク）
| フィールド | 型 | 説明 |
|-----------|------|------|
| id | String | 主キー（CUID） |
| title | String | タスク名 |
| description | Text | 詳細説明 |
| status | Enum | ステータス（TODO, IN_PROGRESS, DONE） |
| priority | Enum | 優先度（LOW, MEDIUM, HIGH） |
| dueDate | DateTime | 期限 |
| userId | String | 担当者ID（外部キー） |
| customerId | String | 関連顧客ID（外部キー、任意） |
| campaignId | String | 関連キャンペーンID（外部キー、任意） |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

#### Campaign（キャンペーン）
| フィールド | 型 | 説明 |
|-----------|------|------|
| id | String | 主キー（CUID） |
| name | String | キャンペーン名 |
| description | Text | 詳細説明 |
| status | Enum | ステータス（DRAFT, ACTIVE, PAUSED, COMPLETED） |
| startDate | DateTime | 開始日 |
| endDate | DateTime | 終了日 |
| budget | Decimal | 予算 |
| userId | String | 作成者ID（外部キー） |
| createdAt | DateTime | 作成日時 |
| updatedAt | DateTime | 更新日時 |

---

## 4. 画面設計

### 4.1 画面一覧

| 画面名 | パス | 説明 |
|--------|------|------|
| ログイン | /login | ログイン画面 |
| ダッシュボード | /dashboard | メイン画面 |
| 顧客一覧 | /customers | 顧客リスト |
| 顧客詳細 | /customers/[id] | 顧客詳細・編集 |
| 顧客新規作成 | /customers/new | 顧客登録 |
| タスク一覧 | /tasks | タスクリスト |
| タスク詳細 | /tasks/[id] | タスク詳細・編集 |
| キャンペーン一覧 | /campaigns | キャンペーンリスト |
| キャンペーン詳細 | /campaigns/[id] | キャンペーン詳細 |
| 設定 | /settings | アプリ設定 |

### 4.2 共通レイアウト

```
┌─────────────────────────────────────────────────┐
│  Header (ロゴ / ナビゲーション / ユーザーメニュー)  │
├─────────────┬───────────────────────────────────┤
│             │                                   │
│  Sidebar    │         Main Content              │
│  (ナビ)     │         (メインコンテンツ)          │
│             │                                   │
│             │                                   │
│             │                                   │
└─────────────┴───────────────────────────────────┘
```

---

## 5. API設計

### 5.1 RESTful API エンドポイント

#### 認証
| メソッド | パス | 説明 |
|----------|------|------|
| POST | /api/auth/login | ログイン |
| POST | /api/auth/logout | ログアウト |
| GET | /api/auth/session | セッション取得 |

#### 顧客
| メソッド | パス | 説明 |
|----------|------|------|
| GET | /api/customers | 顧客一覧取得 |
| POST | /api/customers | 顧客作成 |
| GET | /api/customers/[id] | 顧客詳細取得 |
| PUT | /api/customers/[id] | 顧客更新 |
| DELETE | /api/customers/[id] | 顧客削除 |

#### タスク
| メソッド | パス | 説明 |
|----------|------|------|
| GET | /api/tasks | タスク一覧取得 |
| POST | /api/tasks | タスク作成 |
| GET | /api/tasks/[id] | タスク詳細取得 |
| PUT | /api/tasks/[id] | タスク更新 |
| DELETE | /api/tasks/[id] | タスク削除 |

#### キャンペーン
| メソッド | パス | 説明 |
|----------|------|------|
| GET | /api/campaigns | キャンペーン一覧取得 |
| POST | /api/campaigns | キャンペーン作成 |
| GET | /api/campaigns/[id] | キャンペーン詳細取得 |
| PUT | /api/campaigns/[id] | キャンペーン更新 |
| DELETE | /api/campaigns/[id] | キャンペーン削除 |

---

## 6. セキュリティ要件

### 6.1 認証・認可
- セッションベース認証（NextAuth.js）
- パスワードはbcryptでハッシュ化
- CSRF対策（Next.js組み込み）
- 認証が必要なページへのアクセス制御

### 6.2 データ保護
- HTTPS必須（SSL/TLS）
- SQLインジェクション対策（Prisma使用）
- XSS対策（Reactのエスケープ機能）

---

## 7. 開発ロードマップ

### Phase 1 - MVP（現在のフェーズ）
1. ✅ プロジェクトセットアップ
2. ✅ Coolifyデプロイ設定
3. ⬜ Tailwind CSS導入
4. ⬜ データベーススキーマ設計・実装
5. ⬜ 認証システム実装
6. ⬜ ダッシュボードUI実装
7. ⬜ 顧客管理機能実装
8. ⬜ タスク管理機能実装

### Phase 2 - 機能拡張
- キャンペーン管理
- コンテンツカレンダー
- レポート機能

### Phase 3 - 高度な機能
- アナリティクス連携
- 自動化機能
- AI機能（将来検討）

---

## 8. 運用要件

### 8.1 サーバー環境
- VPS: 210.131.223.161
- Coolify管理画面: http://210.131.223.161:8000
- 本番URL: https://tao-dx.com

### 8.2 バックアップ
- PostgreSQLデータベースの定期バックアップ
- GitHubによるソースコード管理

### 8.3 監視
- Coolifyによるコンテナ監視
- アプリケーションログ収集

---

## 変更履歴

| 日付 | バージョン | 変更内容 |
|------|-----------|---------|
| 2026-01-01 | 1.0.0 | 初版作成 |
