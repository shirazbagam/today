#!/bin/bash
echo "🔍 --- AJKMART DEEP SCAN STARTING ---"
echo "Generated: $(date)"

echo -e "\n1️⃣  PROJECT STRUCTURE & WORKSPACES"
pnpm m ls --depth 0

echo -e "\n2️⃣  BACKEND ENDPOINT ANALYSIS"
grep -r "router\." ./api-server/src/routes || echo "No active routes found in api-server."

echo -e "\n3️⃣  MISSING BUSINESS LOGIC (TODOs & Gaps)"
grep -rn "TODO\|FIXME\|incomplete" ./api-server/src

echo -e "\n4️⃣  DATABASE SCHEMA INTEGRITY"
ls ./lib/db/src/schema/ | wc -l | xargs echo "Total Tables Defined:"
ls ./api-server/src/db/schema.ts &>/dev/null && echo "✅ Primary Schema file exists." || echo "❌ Primary Schema file missing."

echo -e "\n5️⃣  SECURITY & ENV CHECK"
find . -name ".env" | xargs echo "Found .env files at:"
grep -r "cors" ./api-server/src &>/dev/null && echo "✅ CORS is configured." || echo "⚠️  CORS missing (Security Risk)."
grep -r "rateLimit" ./api-server/src &>/dev/null && echo "✅ Rate limiting found." || echo "❌ Rate limiting missing."

echo -e "\n6️⃣  FRONTEND-BACKEND SYNC"
grep -r "axios.get\|axios.post" ./web-app/src | head -n 5 | echo "Frontend API sample calls found."

echo -e "\n--- 🏁 SCAN COMPLETE ---"
