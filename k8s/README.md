# WheelShare Kubernetes Deployment

## Prerequisites
- AWS EKS cluster running
- `kubectl` configured to connect to your cluster
- Docker images pushed to Docker Hub

## Quick Deploy

```bash
cd k8s
chmod +x deploy.sh
./deploy.sh
```

## Manual Deployment Steps

### 1. Create Secrets
```bash
kubectl apply -f secrets.yaml
```

### 2. Create MongoDB Persistent Volume
```bash
kubectl apply -f mongo-pvc.yaml
```

### 3. Deploy MongoDB
```bash
kubectl apply -f mongo-deployment.yaml
```

### 4. Deploy Backend
```bash
kubectl apply -f backend-deployment.yaml
```

### 5. Deploy Frontend
```bash
kubectl apply -f frontend-deployment.yaml
```

## Verify Deployment

```bash
# Check all pods are running
kubectl get pods

# Check services
kubectl get services

# Get LoadBalancer URL
kubectl get service wheelshare-client-service
```

## View Logs

```bash
# Backend logs
kubectl logs -l app=wheelshare-server -f

# MongoDB logs
kubectl logs -l app=mongo -f

# Frontend logs
kubectl logs -l app=wheelshare-client -f
```

## Troubleshooting

### Issue: User account not found after restart
**Cause:** MongoDB data not persisted
**Fix:** Ensure PVC is created and mounted correctly
```bash
kubectl get pvc
kubectl describe pvc mongo-pvc
```

### Issue: JWT token invalid after restart
**Cause:** JWT_SECRET changed between deployments
**Fix:** Secrets are now stored in Kubernetes Secret (never changes)

### Issue: Admin panel not accessible
**Cause:** CORS or routing issue
**Fix:** Check ALLOWED_ORIGINS in backend-deployment.yaml matches your LoadBalancer IP

## Update Deployment

```bash
# Update backend
docker build -t aarish098/wheelshare-server:latest ./wheelshare-server
docker push aarish098/wheelshare-server:latest
kubectl rollout restart deployment wheelshare-server

# Update frontend
docker build -t aarish098/wheelshare-client:latest ./wheelshare-client
docker push aarish098/wheelshare-client:latest
kubectl rollout restart deployment wheelshare-client
```

## Scale Deployment

```bash
# Scale backend
kubectl scale deployment wheelshare-server --replicas=3

# Scale frontend
kubectl scale deployment wheelshare-client --replicas=3
```

## Delete Deployment

```bash
kubectl delete -f frontend-deployment.yaml
kubectl delete -f backend-deployment.yaml
kubectl delete -f mongo-deployment.yaml
kubectl delete -f mongo-pvc.yaml
kubectl delete -f secrets.yaml
```

## Important Notes

1. **MongoDB Data Persistence**: Data is stored in AWS EBS volume via PVC
2. **Secrets Management**: JWT_SECRET and ADMIN_SECRET are stored in Kubernetes Secret
3. **CORS Configuration**: Update ALLOWED_ORIGINS in backend-deployment.yaml with your actual LoadBalancer IP
4. **Health Checks**: Backend has liveness and readiness probes on /api/health
5. **Replicas**: Backend and frontend run 2 replicas for high availability
