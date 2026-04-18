#!/bin/bash

clear
echo "==============================================="
echo "   🛡️  AJKMART SECURE SMART INSTALLER"
echo "==============================================="
echo "1) Development Mode (Testing/Dev)"
echo "2) Production Mode (Live Server/PM2)"
read -p "Select Mode [1 or 2]: " mode

# 1. NODE & PNPM CHECK
echo "🔍 Checking System Requirements..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
if ! command -v pnpm &> /dev/null; then sudo npm install -g pnpm; fi

# 2. PRODUCTION SPECIFIC TOOLS
if [ "$mode" == "2" ]; then
    if ! command -v pm2 &> /dev/null; then sudo npm install -g pm2; fi
fi

# 3. SECURE ENVIRONMENT CONFIGURATION
echo "📄 Setting up Secure Environment (.env)..."
cp .env.example .env

# Common Inputs for both modes
read -p "👤 Enter ADMIN_USERNAME: " admin_user
read -s -p "🔑 Enter ADMIN_SECRET: " admin_sec
echo ""

if [ "$mode" == "2" ]; then
    # Production: Pooch kar set karega
    read -p "🔗 Enter PRODUCTION DATABASE_URL: " db_url
    read -p "🔐 Enter JWT_SECRET (Strong string): " jwt_sec
    
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=$db_url|g" .env
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$jwt_sec|g" .env
    sed -i "s|NODE_ENV=.*|NODE_ENV=production|g" .env
else
    # Test: Realistic Random Keys
    jwt_sec="test_secret_$(date +%s)"
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgres://localhost/ajkmart_test|g" .env
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=$jwt_sec|g" .env
    sed -i "s|NODE_ENV=.*|NODE_ENV=development|g" .env
fi

# Update shared variables
sed -i "s|ADMIN_USERNAME=.*|ADMIN_USERNAME=$admin_user|g" .env
sed -i "s|ADMIN_SECRET=.*|ADMIN_SECRET=$admin_sec|g" .env

# 4. INSTALLING MODULES
echo "🏗️ Installing Project Modules..."
pnpm install
apps=("api-server" "admin" "rider-app" "vendor-app" "ajkmart")
for app in "${apps[@]}"; do
    if [ -d "artifacts/$app" ]; then
        echo "⏳ Installing for $app..."
        cd "artifacts/$app" && pnpm install && cd ../..
    fi
done

# 5. ALIASES & SHORTCUTS
echo "🔗 Configuring Shortcuts..."
sed -i '/start_ajkmart.sh/d' ~/.bashrc
if [ "$mode" == "2" ]; then
    echo "alias live='$(pwd)/start_ajkmart.sh production'" >> ~/.bashrc
    echo "✅ PRODUCTION MODE: Use 'live' to start."
else
    echo "alias test='$(pwd)/start_ajkmart.sh dev'" >> ~/.bashrc
    echo "✅ TEST MODE: Use 'test' to start."
fi

echo "alias api='$(pwd)/start_ajkmart.sh api'" >> ~/.bashrc
echo "alias ajkmart='$(pwd)/start_ajkmart.sh customer'" >> ~/.bashrc

chmod +x start_ajkmart.sh
echo "==============================================="
echo "🎉 SETUP COMPLETE! Run: source ~/.bashrc"
echo "==============================================="
