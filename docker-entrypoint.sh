#!/bin/sh

echo "Running database migrations..."
export HOME=/tmp
prisma migrate deploy || echo "Migration warning (may be first run)"

echo "Starting application..."
exec node server.js
