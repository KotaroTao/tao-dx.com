# 開発環境セットアップガイド

## 開発フロー

```
┌─────────────┐    PR作成     ┌──────────┐    マージ     ┌─────────┐
│ Claude Code │ ────────────> │  GitHub  │ ────────────> │ Coolify │
└─────────────┘               └──────────┘               └────┬────┘
                                                              │
                                   ┌──────────────────────────┘
                                   ▼
                            ┌─────────────┐
                            │ VPS (本番)  │
                            │ tao-dx.com  │
                            └─────────────┘
```

## VPS初期セットアップ（1回のみ）

### 1. Coolifyのインストール

```bash
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

### 2. Coolify管理画面にアクセス

```
https://[VPSのIPアドレス]:8000
```

### 3. Coolifyでの設定

1. **GitHub連携**: Settings → Git → GitHubを接続
2. **プロジェクト作成**: New Project → tao-dx.com
3. **アプリ追加**:
   - Add Resource → Application
   - Repository: KotaroTao/tao-dx.com
   - Build Pack: Dockerfile
4. **PostgreSQL追加**:
   - Add Resource → Database → PostgreSQL
   - 自動で `DATABASE_URL` が設定される
5. **ドメイン設定**:
   - Domains: tao-dx.com
   - SSL: Let's Encrypt（自動）

### 4. PRプレビューの有効化

Coolify の Application Settings で:
- Preview Deployments: ON
- Preview URL Pattern: `pr-{{PR_NUMBER}}.tao-dx.com`

## 日常の開発

### 機能追加・修正

```
1. Claude Codeに依頼
2. PRが作成される
3. Coolifyがプレビュー環境を自動生成
   → https://pr-123.tao-dx.com で確認
4. GitHubでマージ
5. 本番に自動デプロイ
```

### Termiusが必要な場面（稀）

- Coolifyのトラブルシューティング
- サーバーログの確認
- 手動でのDB操作

## ローカル開発（オプション）

VPS上で直接開発する場合:

```bash
cd /var/www/tao-dx.com

# 開発サーバー起動
npm run dev

# Prisma Studio（DB管理UI）
npm run db:studio
```

## 環境変数

Coolifyの管理画面で設定:

| 変数名 | 説明 |
|--------|------|
| `DATABASE_URL` | PostgreSQL接続URL（自動設定） |

## トラブルシューティング

### デプロイが失敗する

1. Coolify → Deployments でログを確認
2. Dockerビルドエラーがないか確認

### DBに接続できない

1. PostgreSQLコンテナが起動しているか確認
2. `DATABASE_URL` が正しく設定されているか確認
