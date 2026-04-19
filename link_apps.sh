#!/bin/bash
echo "🔗 --- LINKING ALL APPS TO NEW BACKEND ---"

# Backend URL define karo
BACKEND_URL="http://localhost:4000/api"

# 1. Sab apps ke .env files update karo
APPS=("web-app" "rider-app" "vendor-app" "ajkmart")

for APP in "${APPS[@]}"; do
  if [ -d "$APP" ]; then
    echo "Updating $APP..."
    # .env ya .env.local mein URL daalo
    echo "NEXT_PUBLIC_API_URL=$BACKEND_URL" > $APP/.env.local
    echo "EXPO_PUBLIC_API_URL=$BACKEND_URL" >> $APP/.env # For Expo/Mobile
    echo "✅ $APP linked."
  else
    echo "⚠️ $APP directory not found, skipping."
  fi
done

# 2. Axios Instance ko unify karo (Admin/Web-app ke liye)
# Hum aik generic helper banatay hain jo tokens handle karay
cat << 'INNER_EOF' > web-app/src/lib/api-client.ts
import axios from 'axios';
const apiClient = axios.create({
  baseURL: 'http://localhost:4000/api',
});
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = \`Bearer \${token}\`;
  return config;
});
export default apiClient;
INNER_EOF

echo "🚀 --- ALL APPS READY TO FETCH FROM NEON DB ---"
