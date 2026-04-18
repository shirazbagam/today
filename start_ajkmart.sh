#!/bin/bash

# --- DYNAMIC URL DETECTION ---
if [ -n "$CODESPACE_NAME" ]; then
    export DYNAMIC_URL="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
else
    export DYNAMIC_URL="http://$(curl -s ifconfig.me || echo 'localhost'):3000"
fi

export VITE_API_URL="$DYNAMIC_URL"
export NEXT_PUBLIC_API_URL="$DYNAMIC_URL"

case $1 in
  dev|test)
    echo "🧪 Starting AJKMart in TEST Mode..."
    cd artifacts/api-server && npx dotenv -e ../../.env -- pnpm run dev &
    cd artifacts/ajkmart && PORT=3003 npx dotenv -e ../../.env -- pnpm exec expo start --web
    ;;
  production|live)
    echo "🚀 Launching AJKMart PRODUCTION (PM2)..."
    pm2 delete all 2>/dev/null
    cd artifacts/api-server && pm2 start index.js --name ajkmart-api -- --dotenv ../../.env
    cd artifacts/admin && pm2 start npm --name ajkmart-admin -- run start
    echo "✅ All systems LIVE. Use 'pm2 status' to monitor."
    ;;
  api) cd artifacts/api-server && npx dotenv -e ../../.env -- pnpm run dev ;;
  customer) cd artifacts/ajkmart && PORT=3003 npx dotenv -e ../../.env -- pnpm exec expo start --web ;;
  *) echo "Usage: test | live | api | customer" ;;
esac
