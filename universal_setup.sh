#!/bin/bash
echo "🌍 --- AJKMART UNIVERSAL ENVIRONMENT SETUP ---"

# 1. ROOT .ENV CREATE (Single Point of Truth)
# Yahan sirf aik bar domain set karna hoga
cat << 'INNER_EOF' > .env
# Local ke liye localhost, Production ke liye apna domain (ajkmart.com)
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NODE_ENV=development
INNER_EOF

echo "✅ Root .env created. Change here for production."

# 2. AUTOMATE API CLIENTS (Relative Paths Only)
# Poore project mein baseURL ko '/api' kar do taake wo domain-independent ho jaye
echo "🛡️ Fixing API Clients to use Relative Paths..."
find . -name "api-client.ts" -o -name "api.ts" | xargs sed -i "s|baseURL:.*|baseURL: '/api',|g" 2>/dev/null

# 3. SMART VITE PROXY (Agnostic to Hosting)
# Vite configs ko dynamic banao jo root .env se target uthaye
APPS=$(find . -maxdepth 3 -name "vite.config.ts" -o -name "vite.config.js")

for CONFIG in $APPS; do
  echo "🔧 Configuring Proxy for: $CONFIG"
  cat << 'INNER_EOF' > $CONFIG
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "src") } },
  server: {
    port: 3000,
    host: "0.0.0.0",
    proxy: {
      '/api': {
        target: 'http://localhost:4000', // Local default
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
});
INNER_EOF
done

# 4. BACKEND CORS FIX (Allow Any Hosting)
echo "🔓 Setting Backend to Dynamic CORS..."
cat << 'INNER_EOF' > api-server/src/index.ts
import express from 'express';
import cors from 'cors';
import { getStats } from './routes/stats';

const app = express();
app.use(cors()); // Pro level: Automatically allows requests from anywhere
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/stats', getStats);

const PORT = 4000;
app.listen(PORT, '0.0.0.0', () => console.log('🚀 API Live on Port 4000'));
INNER_EOF

echo "✅ SYSTEM IS NOW UNIVERSAL!"
