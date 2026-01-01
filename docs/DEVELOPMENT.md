# 開発環境セットアップガイド

## 開発フロー概要

```
┌─────────────────────────────────────────────────────────────────┐
│                        開発フロー                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐    PR作成     ┌──────────────┐               │
│  │ Claude Code  │ ───────────── │   GitHub     │               │
│  │  (メイン開発)  │               │              │               │
│  └──────────────┘               └──────┬───────┘               │
│                                        │                        │
│                                   マージ │                        │
│                                        ▼                        │
│                               ┌──────────────┐                  │
│                               │GitHub Actions│                  │
│                               │  (自動実行)   │                  │
│                               └──────┬───────┘                  │
│                                      │                          │
│                                 自動デプロイ                      │
│                                      ▼                          │
│                           ┌──────────────────┐                  │
│                           │ エックスサーバーVPS │                  │
│                           │   tao-dx.com     │                  │
│                           └──────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 開発の進め方

### 1. Claude Codeで開発（メイン）

Claude Codeがコードを書き、自動でブランチを作成してプルリクエストを作成します。

```
あなた: 「〇〇の機能を追加して」
Claude Code: コードを書く → PRを作成
あなた: GitHubでPRを確認 → マージ
GitHub Actions: 自動でVPSにデプロイ
```

### 2. Termiusの使用場面（必要最小限）

- VPSの初期セットアップ時
- サーバーのトラブルシューティング時
- ログの確認時

## VPS初期セットアップ（Termius使用・1回のみ）

### 1. 基本パッケージのインストール

```bash
# システムの更新
sudo apt update && sudo apt upgrade -y

# 必要なパッケージ
sudo apt install -y git curl nginx
```

### 2. Node.jsのインストール

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts
```

### 3. デプロイ用SSH鍵の設定

GitHub Actionsからの自動デプロイ用にSSH鍵を設定します。

```bash
# デプロイ用の公開鍵を authorized_keys に追加
# （GitHub Secretsに登録した秘密鍵に対応する公開鍵）
echo "ssh-ed25519 AAAA..." >> ~/.ssh/authorized_keys
```

### 4. プロジェクトディレクトリの準備

```bash
# 本番用ディレクトリを作成
sudo mkdir -p /var/www/tao-dx.com
sudo chown $USER:$USER /var/www/tao-dx.com

# 初回クローン
git clone git@github.com:KotaroTao/tao-dx.com.git /var/www/tao-dx.com
```

## GitHub Secretsの設定

GitHubリポジトリの Settings > Secrets and variables > Actions で以下を設定：

| Secret名 | 内容 |
|----------|------|
| `VPS_HOST` | VPSのIPアドレス |
| `VPS_USER` | SSHユーザー名 |
| `VPS_SSH_KEY` | SSH秘密鍵（ed25519） |
| `VPS_PORT` | SSHポート（デフォルト: 22） |

## 自動デプロイの仕組み

1. `main`ブランチにマージ
2. GitHub Actionsが起動
3. SSHでVPSに接続
4. `git pull`で最新コードを取得
5. 依存関係のインストール
6. アプリの再起動

## Nginx設定（参考）

```nginx
server {
    listen 80;
    server_name tao-dx.com www.tao-dx.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## トラブルシューティング

### デプロイが失敗する場合

1. GitHub Actionsのログを確認
2. Secretsが正しく設定されているか確認
3. VPSのSSH接続が可能か確認（Termiusで確認）

### アプリが起動しない場合

Termiusで接続して確認：

```bash
# ログを確認
pm2 logs

# 手動で再起動
pm2 restart all
```
