#!/bin/sh

echo "Syncing database schema..."
export HOME=/tmp
# ローカルのPrisma CLIを使用
./node_modules/prisma/build/index.js db push --accept-data-loss || echo "Schema sync warning"

echo "Starting application..."
exec node server.js
