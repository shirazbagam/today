#!/bin/bash

clear
echo "==============================================="
echo "   🛡️  AJKMART SECURE SMART INSTALLER (FINAL)"
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

# 2. PRODUCTION TOOLS
if [ "$mode" == "2" ]; then
    if ! command -v pm2 &> /dev/null; then sudo npm install -g pm2; fi
fi

# 3. SECURE ENVIRONMENT CONFIGURATION
echo "📄 Setting up Environment (.env)..."
cp .env.example .env 2>/dev/null || touch .env

read -p "👁️ Show password while typing? (y/n): " show_pass
read -p "👤 Enter ADMIN_USERNAME: " admin_user

if [ "$show_pass" == "y" ]; then
    read -p "🔑 Enter ADMIN_SECRET: " admin_sec
else
    read -s -p "🔑 Enter ADMIN_SECRET (Hidden): " admin_sec
    echo ""
fi

# JWT Secret Generation (Minimum 32 characters for security)
jwt_sec=$(openssl rand -base64 32)

if [ "$mode" == "2" ]; then
    read -p "🔗 Enter PRODUCTION DATABASE_URL: " db_url
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=$db_url|g" .env
    sed -i "s|NODE_ENV=.*|NODE_ENV=production|g" .env
else
    sed -i "s|DATABASE_URL=.*|DATABASE_URL=postgres://localhost/ajkmart_test|g" .env
    sed -i "s|NODE_ENV=.*|NODE_ENV=development|g" .env
fi

sed -i "s|JWT_SECRET=.*|JWT_SECRET=$jwt_sec|g" .env
sed -i "s|ADMIN_USERNAME=.*|ADMIN_USERNAME=$admin_user|g" .env
sed -i "s|ADMIN_SECRET=.*|ADMIN_SECRET=$admin_sec|g" .env

# 4. MODULES INSTALLATION
echo "🏗️ Installing Project Modules..."
pnpm install
apps=("api-server" "admin" "rider-app" "vendor-app" "ajkmart")
for app in "${apps[@]}"; do
    if [ -d "artifacts/$app" ]; then
        echo "⏳ Installing for $app..."
        cd "artifacts/$app" && pnpm install && cd ../..
    fi
done

# 5. ALIASES SETUP
echo "🔗 Configuring Shortcuts..."
sed -i '/start_ajkmart.sh/d' ~/.bashrc
echo "alias api='$(pwd)/start_ajkmart.sh api'" >> ~/.bashrc
echo "alias admin='$(pwd)/start_ajkmart.sh admin'" >> ~/.bashrc
echo "alias rider='$(pwd)/start_ajkmart.sh rider'" >> ~/.bashrc
echo "alias vendor='$(pwd)/start_ajkmart.sh vendor'" >> ~/.bashrc
echo "alias ajkmart='$(pwd)/start_ajkmart.sh ajkmart'" >> ~/.bashrc
echo "alias test='$(pwd)/start_ajkmart.sh test'" >> ~/.bashrc
echo "alias live='$(pwd)/start_ajkmart.sh live'" >> ~/.bashrc

chmod +x start_ajkmart.sh
echo "✅ SETUP COMPLETE! Ab 'source ~/.bashrc' run karein."
