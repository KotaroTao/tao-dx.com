# T.A.O Marketing System

**Think / Act / Optimize** - 考え、動き、改善する

## 概要

T.A.O Marketing Systemは、マーケティング業務を効率化するためのWEBアプリケーションです。

- **T**hink（考える）：データに基づいた戦略立案
- **A**ct（動く）：効率的な実行と自動化
- **O**ptimize（改善する）：継続的な改善サイクル

## 開発者

**田尾耕太郎**（Kotaro Tao）

## 技術スタック

| 分類 | 技術 |
|------|------|
| フレームワーク | Next.js 14 (App Router) |
| 言語 | TypeScript |
| データベース | PostgreSQL |
| ORM | Prisma |
| インフラ | Coolify (VPS) |
| コンテナ | Docker |

## 開発フロー

```
Claude Code → GitHub PR → マージ → 自動デプロイ（Coolify）
```

## ドメイン

- 本番環境: https://tao-dx.com

## ローカル開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev
```

## ドキュメント

- [開発環境セットアップ](docs/DEVELOPMENT.md)

## ライセンス

Private - All rights reserved
