#!/bin/bash

echo "🚀 Deploying WheelShare to Kubernetes..."

# Apply secrets first
echo "📦 Creating secrets..."
kubectl apply -f secrets.yaml

# Create PVC for MongoDB
echo "💾 Creating MongoDB persistent volume..."
kubectl apply -f mongo-pvc.yaml

# Deploy MongoDB
echo "🗄️  Deploying MongoDB..."
kubectl apply -f mongo-deployment.yaml

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
kubectl wait --for=condition=ready pod -l app=mongo --timeout=120s

# Deploy backend
echo "🔧 Deploying backend..."
kubectl apply -f backend-deployment.yaml

# Wait for backend to be ready
echo "⏳ Waiting for backend to be ready..."
kubectl wait --for=condition=ready pod -l app=wheelshare-server --timeout=120s

# Deploy frontend
echo "🎨 Deploying frontend..."
kubectl apply -f frontend-deployment.yaml

echo "✅ Deployment complete!"
echo ""
echo "📊 Check status:"
echo "  kubectl get pods"
echo "  kubectl get services"
echo ""
echo "🔍 View logs:"
echo "  kubectl logs -l app=wheelshare-server"
echo "  kubectl logs -l app=mongo"
echo ""
echo "🌐 Get LoadBalancer URL:"
echo "  kubectl get service wheelshare-client-service"
