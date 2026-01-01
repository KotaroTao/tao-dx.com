# 開発環境セットアップガイド

## 概要

T.A.O Marketing Systemは、iPadからリモート開発できる環境を構築しています。

```
┌─────────────┐     SSH      ┌──────────────────┐
│   iPad      │ ──────────── │  エックスサーバー │
│  (Termius)  │              │      VPS         │
└─────────────┘              └──────────────────┘
                                      │
                              ┌───────┴───────┐
                              │               │
                        ┌─────▼─────┐   ┌─────▼─────┐
                        │ Claude    │   │  GitHub   │
                        │ Code      │   │           │
                        └───────────┘   └───────────┘
```

## 必要なツール

### iPad側
- **Termius** - SSH/SFTPクライアント
  - App Storeからダウンロード
  - VPSへのSSH接続に使用

### サーバー側（エックスサーバーVPS）
- **Git** - バージョン管理
- **Node.js** - JavaScriptランタイム（推奨: LTS版）
- **Claude Code CLI** - AI開発アシスタント

## セットアップ手順

### 1. VPSの初期設定

```bash
# システムの更新
sudo apt update && sudo apt upgrade -y

# 必要なパッケージのインストール
sudo apt install -y git curl wget build-essential
```

### 2. Node.jsのインストール

```bash
# Node.js LTSのインストール（nvm経由）
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install --lts
nvm use --lts
```

### 3. Claude Code CLIのセットアップ

```bash
# Claude Codeのインストール
npm install -g @anthropic-ai/claude-code

# 認証設定
claude-code auth
```

### 4. GitHubとの連携

```bash
# SSH鍵の生成
ssh-keygen -t ed25519 -C "your-email@example.com"

# 公開鍵を表示（GitHubに登録）
cat ~/.ssh/id_ed25519.pub

# SSH接続のテスト
ssh -T git@github.com
```

### 5. プロジェクトのクローン

```bash
git clone git@github.com:KotaroTao/tao-dx.com.git
cd tao-dx.com
```

## Termiusの設定

### 新しいホストの追加

1. Termiusを開く
2. 「+」ボタンで新規ホストを追加
3. 以下を設定:
   - **Label**: TAO VPS
   - **Hostname**: （VPSのIPアドレス）
   - **Port**: 22
   - **Username**: （ユーザー名）
   - **Password** または **Key**: 認証情報

### 推奨設定

- **Keep Alive**: 有効（接続を維持）
- **Font Size**: 14-16pt（iPadで見やすいサイズ）

## 日常の開発フロー

```bash
# 1. 最新のコードを取得
git pull origin main

# 2. Claude Codeで開発
claude-code

# 3. 変更をコミット
git add .
git commit -m "変更内容の説明"

# 4. GitHubにプッシュ
git push origin main
```

## ドメイン設定（tao-dx.com）

*エックスサーバーVPSでのドメイン設定手順は別途記載*

## トラブルシューティング

### SSH接続が切れる場合

Termiusの設定で「Keep Alive」を有効にしてください。

### パーミッションエラーが発生する場合

```bash
# ファイルの所有権を確認
ls -la

# 必要に応じて所有権を変更
sudo chown -R $USER:$USER /path/to/project
```
