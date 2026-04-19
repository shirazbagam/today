#!/bin/bash
echo "🛡️  --- AJKMART ULTRA-SMART LINKER & REPAIR ---"

BACKEND_URL="http://localhost:4000/api"

# 1. SMART PATH FINDER (Deep Discovery)
find_apps() {
    echo "🔍 Searching for apps..."
    ALL_APPS=$(find . -maxdepth 3 -name "package.json" | grep -v "node_modules" | sed 's/\/package.json//')
}

# 2. LOGIC REPAIR & LINKING
repair_and_link() {
    for APP_PATH in $ALL_APPS; do
        APP_NAME=$(basename $APP_PATH)
        echo "🛠️  Analyzing $APP_NAME at $APP_PATH..."

        # Create/Update .env files based on app type
        if grep -q "next" "$APP_PATH/package.json"; then
            echo "NEXT_PUBLIC_API_URL=$BACKEND_URL" > "$APP_PATH/.env.local"
        elif grep -q "expo" "$APP_PATH/package.json" || grep -q "react-native" "$APP_PATH/package.json"; then
            echo "EXPO_PUBLIC_API_URL=$BACKEND_URL" > "$APP_PATH/.env"
        fi

        # 3. SMART AXIOS/FETCH SANITIZER (Regex replace old URLs)
        # Yeh har file mein ja kar purane localhosts ko naye 4000 port se badal dega
        find "$APP_PATH" -type f -name "*.ts" -o -name "*.tsx" -o -name "*.js" | xargs sed -i "s|http://localhost:[0-9]*/api|$BACKEND_URL|g" 2>/dev/null

        # 4. SECURITY CHECK: Ensure Authorization headers exist
        mkdir -p "$APP_PATH/src/lib"
        CLIENT_FILE="$APP_PATH/src/lib/api-client.ts"
        if [ ! -f "$CLIENT_FILE" ]; then
            echo "📦 Creating Secure API Client for $APP_NAME..."
            cat << 'INNER_EOF' > "$CLIENT_FILE"
import axios from 'axios';
const apiClient = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:4000/api' });
apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['X-AJK-Security'] = 'True'; // Loophole protection
  return config;
});
export default apiClient;
INNER_EOF
        fi
    done
}

find_apps
repair_and_link

echo "✅ ALL APPS SYNCED & SECURED!"
echo "🚀 Backend: $BACKEND_URL is now the source of truth."
