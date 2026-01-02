#!/bin/sh
set -e

echo "Running database migrations..."
npx prisma db push --accept-data-loss || echo "Migration warning (continuing anyway)"

echo "Starting application..."
exec node server.js
