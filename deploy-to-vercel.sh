#!/bin/bash

echo "🚀 Deploying WheelShare to Vercel"
echo "=================================="
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

echo "✅ Vercel CLI is available"
echo ""

# Deploy backend
echo "1️⃣ Deploying Backend..."
cd wheelshare-server
echo "   📦 Deploying to Vercel..."
vercel --prod
BACKEND_URL=$(vercel ls --prod | grep wheelshare-server | awk '{print $2}')
echo "   ✅ Backend deployed!"
echo "   🌐 Backend URL: $BACKEND_URL"
echo ""

# Update frontend env
cd ../wheelshare-client
echo "2️⃣ Updating Frontend Environment..."
echo "VITE_API_URL=${BACKEND_URL}/api" > .env.production
echo "   ✅ Frontend .env.production updated"
echo ""

# Deploy frontend
echo "3️⃣ Deploying Frontend..."
vercel --prod
echo "   ✅ Frontend deployed!"
echo ""

echo "=================================="
echo "✅ Deployment Complete!"
echo "=================================="
echo ""
echo "🌐 Your URLs:"
echo "   Frontend: https://wheel-share-z5wy.vercel.app"
echo "   Backend:  $BACKEND_URL"
echo ""
echo "🔐 Admin Login:"
echo "   URL:      https://wheel-share-z5wy.vercel.app/admin2/login"
echo "   Email:    admin@wheelshare.com"
echo "   Password: admin123"
echo ""



