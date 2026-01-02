#!/bin/sh

echo "Syncing database schema..."
export HOME=/tmp
prisma db push --accept-data-loss || echo "Schema sync warning"

echo "Starting application..."
exec node server.js
