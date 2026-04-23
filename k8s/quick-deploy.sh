#!/bin/bash

set -e

echo "🚀 WheelShare Quick Deploy to AWS EKS"
echo "======================================"
echo ""

# Check kubectl is configured
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ kubectl is not configured. Please configure kubectl first."
    exit 1
fi

echo "✅ kubectl is configured"
echo ""

# Delete old deployments
echo "🗑️  Cleaning up old deployments..."
kubectl delete deployment wheelshare-server --ignore-not-found
kubectl delete deployment wheelshare-client --ignore-not-found
kubectl delete deployment mongo --ignore-not-found
kubectl delete service wheelshare-server-service --ignore-not-found
kubectl delete service wheelshare-client-service --ignore-not-found
kubectl delete service mongo-service --ignore-not-found
kubectl delete job init-admin --ignore-not-found

echo "✅ Cleanup complete"
echo ""

# Apply secrets
echo "🔐 Creating secrets..."
kubectl apply -f secrets.yaml

# Create PVC
echo "💾 Creating persistent volume..."
kubectl apply -f mongo-pvc.yaml

# Deploy MongoDB
echo "🗄️  Deploying MongoDB..."
kubectl apply -f mongo-deployment.yaml

# Wait for MongoDB
echo "⏳ Waiting for MongoDB to be ready (this may take 2-3 minutes)..."
kubectl wait --for=condition=ready pod -l app=mongo --timeout=300s

echo "✅ MongoDB is ready"
echo ""

# Deploy backend
echo "🔧 Deploying backend..."
kubectl apply -f backend-deployment.yaml

# Wait for backend
echo "⏳ Waiting for backend to be ready..."
kubectl wait --for=condition=ready pod -l app=wheelshare-server --timeout=300s

echo "✅ Backend is ready"
echo ""

# Deploy frontend
echo "🎨 Deploying frontend..."
kubectl apply -f frontend-deployment.yaml

echo "⏳ Waiting for frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=wheelshare-client --timeout=300s

echo "✅ Frontend is ready"
echo ""

# Create admin account
echo "👤 Creating admin account..."
kubectl apply -f init-admin-job.yaml

sleep 10
kubectl logs job/init-admin

echo ""
echo "======================================"
echo "✅ Deployment Complete!"
echo "======================================"
echo ""

# Get LoadBalancer URL
echo "🌐 Getting LoadBalancer URL..."
echo ""
kubectl get service wheelshare-client-service

echo ""
echo "⚠️  IMPORTANT: Update CORS Configuration"
echo "======================================"
echo "1. Copy the EXTERNAL-IP from above"
echo "2. Run: kubectl edit deployment wheelshare-server"
echo "3. Update ALLOWED_ORIGINS with your LoadBalancer URL"
echo "4. Save and exit"
echo ""
echo "📊 Check Status:"
echo "  kubectl get pods"
echo "  kubectl get pvc"
echo "  kubectl logs -l app=wheelshare-server"
echo ""
echo "🎉 Access your app at: http://YOUR_LOADBALANCER_URL"
echo "🔑 Admin: http://YOUR_LOADBALANCER_URL/admin2/login"
echo "   Email: admin@wheelshare.com"
echo "   Password: admin123"
