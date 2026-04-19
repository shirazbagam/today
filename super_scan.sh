#!/bin/bash
echo "# AJKMart System Deep Scan Report"
echo "**Generated:** $(date -u)"
echo "**Root:** $(pwd)"

echo -e "\n## 1. Project Overview"
echo "- Monorepo with pnpm workspaces"
echo "- **Applications found:**"
find . -maxdepth 2 -name "package.json" | grep -v "node_modules" | sed 's/\/package.json//' | sed 's/.\///' | while read line; do echo "  - $line"; done

echo -e "\n## 2. Backend API Endpoints (Detected)"
echo "| Method | Endpoint |"
echo "|--------|----------|"
grep -rE "\.(get|post|put|delete)\(['\"]" ./api-server/src | grep -v "node_modules" | sed -E "s/.*(get|post|put|delete)\(['\"]([^'\"]+)['\"].*/| \1 | \2 |/" | sort -u

echo -e "\n## 3. Database Schema (Tables)"
find . -name "*.ts" | xargs grep -h "pgTable('" | sed -E "s/.*pgTable\('([^']+)',.*/- \`\1\`/" | sort -u

echo -e "\n## 4. Schema File Locations & Imports"
grep -r "from 'drizzle-orm/pg-core'" . --include="*.ts" | grep -v "node_modules"

echo -e "\n## 5. System Health Check"
[ -f ".env" ] && echo "✅ Root .env found" || echo "❌ Root .env missing"
[ -d "api-server" ] && echo "✅ API Server directory exists"
[ -f "pnpm-workspace.yaml" ] && echo "✅ PNPM Workspace detected"

echo -e "\n--- 🏁 SCAN COMPLETE ---"
