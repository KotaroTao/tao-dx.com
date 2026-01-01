#!/bin/bash
#
# T.A.O Marketing System - VPS初期セットアップスクリプト
#
# 使用方法（Termiusで1回実行）:
#   curl -sSL https://raw.githubusercontent.com/KotaroTao/tao-dx.com/main/scripts/setup-vps.sh | bash
#

set -e

echo "========================================"
echo " T.A.O Marketing System - VPS Setup"
echo "========================================"

# 1. システムの更新
echo "[1/6] システムを更新中..."
sudo apt update && sudo apt upgrade -y

# 2. 必要なパッケージのインストール
echo "[2/6] 必要なパッケージをインストール中..."
sudo apt install -y git curl nginx

# 3. Node.jsのインストール（nvm経由）
echo "[3/6] Node.jsをインストール中..."
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
fi
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install --lts
nvm use --lts

# 4. PM2のインストール
echo "[4/6] PM2をインストール中..."
npm install -g pm2

# 5. プロジェクトディレクトリの準備
echo "[5/6] プロジェクトディレクトリを準備中..."
sudo mkdir -p /var/www/tao-dx.com
sudo chown $USER:$USER /var/www/tao-dx.com

# 6. リポジトリのクローン
echo "[6/6] リポジトリをクローン中..."
if [ ! -d "/var/www/tao-dx.com/.git" ]; then
    git clone https://github.com/KotaroTao/tao-dx.com.git /var/www/tao-dx.com
else
    echo "リポジトリは既にクローン済みです"
fi

echo ""
echo "========================================"
echo " セットアップ完了!"
echo "========================================"
echo ""
echo "次のステップ:"
echo "1. GitHub Secretsを設定してください"
echo "2. SSH鍵を設定してください"
echo "3. Nginxを設定してください"
echo ""
echo "詳細: docs/DEVELOPMENT.md"
