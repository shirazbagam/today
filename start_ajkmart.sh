#!/bin/bash

# --- SMART ENVIRONMENT DETECTION ---
if [ -n "$CODESPACE_NAME" ]; then
    export DYNAMIC_URL="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
    echo "🌍 Environment: GitHub Codespaces"
elif [ -n "$REPL_ID" ]; then
    export DYNAMIC_URL="https://${REPL_SLUG}.${REPL_OWNER}.repl.co"
    echo "🌍 Environment: Replit"
else
    export DYNAMIC_URL="http://localhost:3000"
    echo "🌍 Environment: Local/VPS"
fi

# --- EXPORTS ---
export VITE_API_URL="$DYNAMIC_URL"
export VITE_API_BASE_URL="$DYNAMIC_URL"
export NEXT_PUBLIC_API_URL="$DYNAMIC_URL"
export EXPO_PUBLIC_API_URL="$DYNAMIC_URL"

# --- .ENV SETUP ---
if [ ! -f .env ]; then cp .env.example .env; fi

# --- APPS EXECUTION ---
case $1 in
  api) cd artifacts/api-server && npx dotenv -e ../../.env -- pnpm run dev ;;
  admin) cd artifacts/admin && npx dotenv -e ../../.env -- pnpm run dev ;;
  rider) cd artifacts/rider-app && npx dotenv -e ../../.env -- pnpm run dev ;;
  vendor) cd artifacts/vendor-app && npx dotenv -e ../../.env -- pnpm run dev ;;
  customer) cd artifacts/ajkmart && PORT=3003 npx dotenv -e ../../.env -- pnpm exec expo start --web --clear ;;
  *) echo "Usage: api | admin | rider | vendor | ajkmart" ;;
esac
