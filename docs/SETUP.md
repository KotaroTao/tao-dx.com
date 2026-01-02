# T.A.O Marketing System セットアップガイド

## 概要

このガイドでは、T.A.O Marketing Systemのデプロイと初期設定の手順を説明します。

---

## 1. Coolify環境変数の設定

### 1.1 管理画面にアクセス

```
URL: http://210.131.223.161:8000
```

### 1.2 必要な環境変数

プロジェクト設定 → Environment Variables で以下を設定：

| 変数名 | 値 | 必須 | 説明 |
|--------|-----|------|------|
| `DATABASE_URL` | `postgresql://...` | ✅ | PostgreSQL接続URL（Coolifyが自動設定） |
| `NEXTAUTH_URL` | `https://tao-dx.com` | ✅ | アプリケーションの本番URL |
| `NEXTAUTH_SECRET` | ランダム文字列 | ✅ | セッション暗号化キー（32文字以上推奨） |
| `SETUP_KEY` | ランダム文字列 | ✅ | 初期ユーザー作成用のキー |

### 1.3 シークレットキーの生成

ターミナルで以下のコマンドを実行：

```bash
# NEXTAUTH_SECRET用
openssl rand -base64 32

# SETUP_KEY用
openssl rand -base64 16
```

---

## 2. デプロイ

### 2.1 GitHubでPRを作成・マージ

1. GitHubでPull Requestを作成
2. レビュー後、mainブランチにマージ
3. Coolifyが自動的にデプロイを開始

### 2.2 デプロイ確認

Coolify管理画面でデプロイステータスを確認。
成功すると https://tao-dx.com でアクセス可能になります。

---

## 3. データベースマイグレーション

コンテナ起動時に自動実行されます（docker-entrypoint.sh）。

手動で実行する場合：

```bash
# Coolifyのターミナル機能を使用
npx prisma db push
```

---

## 4. 初期管理者ユーザーの作成

### 4.1 APIを使用してユーザー作成

```bash
curl -X POST https://tao-dx.com/api/setup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-secure-password",
    "name": "管理者",
    "setupKey": "YOUR_SETUP_KEY"
  }'
```

### 4.2 レスポンス例

成功時：
```json
{
  "message": "ユーザーが作成されました",
  "user": {
    "id": "clxxxxxxxxxxxxxxxxx",
    "email": "admin@example.com",
    "name": "管理者",
    "role": "ADMIN"
  }
}
```

エラー時：
```json
{
  "error": "無効なセットアップキーです"
}
```

---

## 5. ログイン確認

1. https://tao-dx.com/login にアクセス
2. 作成したメールアドレスとパスワードでログイン
3. ダッシュボードが表示されれば成功

---

## トラブルシューティング

### データベース接続エラー

```
Error: P1001: Can't reach database server
```

対処法：
- Coolifyで`DATABASE_URL`が正しく設定されているか確認
- PostgreSQLコンテナが起動しているか確認

### 認証エラー

```
Error: NEXTAUTH_SECRET is not set
```

対処法：
- `NEXTAUTH_SECRET`環境変数を設定
- アプリケーションを再デプロイ

### マイグレーションエラー

```
Error: P3005: The database schema is not empty
```

対処法：
- 既存のデータがある場合は `prisma db push --force-reset` を使用（データは消去されます）

---

## セキュリティに関する注意

1. **SETUP_KEY**は初期設定完了後、環境変数から削除することを推奨
2. **パスワード**は十分に長く複雑なものを使用
3. **NEXTAUTH_SECRET**は絶対に公開しない

---

## 次のステップ

- 追加ユーザーの作成（設定画面から）
- 顧客データのインポート
- キャンペーンの作成
