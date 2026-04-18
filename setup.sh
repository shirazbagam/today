#!/bin/bash
clear
echo "==============================================="
echo "   🛡️  AJKMART SECURE INSTALLER (FIXED)"
echo "==============================================="
read -p "Select Mode [1-Dev, 2-Prod]: " mode
cp .env.example .env 2>/dev/null || touch .env
jwt_sec=$(openssl rand -base64 32)
read -p "Enter ADMIN_USERNAME: " admin_user
read -p "Enter ADMIN_SECRET: " admin_sec
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$jwt_sec|g" .env
sed -i "s|ADMIN_USERNAME=.*|ADMIN_USERNAME=$admin_user|g" .env
sed -i "s|ADMIN_SECRET=.*|ADMIN_SECRET=$admin_sec|g" .env
echo "✅ Environment fixed with long JWT secret."
