#!/bin/bash
echo "🏗️  --- AJKMART ENTERPRISE ORCHESTRATOR ---"

# 1. Environment Detection
if [ ! -z "$CODESPACE_NAME" ]; then
  BASE_URL="https://${CODESPACE_NAME}-4000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  echo "🌐 Environment: GitHub Codespaces"
else
  BASE_URL="http://localhost:4000"
  echo "💻 Environment: Local/VPS"
fi

# 2. Find All Apps
APPS=$(find . -maxdepth 3 -name "package.json" | grep -v "node_modules" | sed 's/\/package.json//')

for APP_PATH in $APPS; do
  APP_NAME=$(basename $APP_PATH)
  echo "⚙️  Configuring $APP_NAME..."

  # A. Set Environment Variables (Universal)
  echo "VITE_API_URL=/api" > "$APP_PATH/.env"
  echo "NEXT_PUBLIC_API_URL=/api" >> "$APP_PATH/.env"
  echo "BACKEND_PROXY_TARGET=$BASE_URL" >> "$APP_PATH/.env"

  # B. Inject Vite Proxy (If Vite App)
  if [ -f "$APP_PATH/vite.config.ts" ] || [ -f "$APP_PATH/vite.config.js" ]; then
    echo "🔧 Injecting Proxy into Vite Config..."
    sed -i "/server: {/d" "$APP_PATH/vite.config.ts" 2>/dev/null
    # Insert professional proxy config
    sed -i "s/export default defineConfig({/export default defineConfig({\n  server: { proxy: { '\/api': { target: '$BASE_URL', changeOrigin: true, rewrite: (path) => path.replace(/^\/api/, '') } } },/" "$APP_PATH/vite.config.ts" 2>/dev/null
  fi

  # C. Clean Hardcoded URLs from Code
  echo "🧹 Cleaning hardcoded URLs in $APP_NAME..."
  find "$APP_PATH/src" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) -exec sed -i "s|http://localhost:4000/api||g" {} + 2>/dev/null
  find "$APP_PATH/src" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \) -exec sed -i "s|https://.*-4000.app.github.dev/api||g" {} + 2>/dev/null
done

# 3. Finalize API Client (Safe Relative Calls)
echo "🛡️ Finalizing Secure API Client..."
find . -name "api-client.ts" -exec sed -i "s|baseURL:.*|baseURL: '/api',|g" {} +

echo "✅ SYSTEM CONFIGURED SUCCESSFULLY!"
echo "💡 Usage: Now just call fetch('/api/stats') and it will work everywhere."
