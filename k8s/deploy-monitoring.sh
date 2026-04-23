#!/bin/bash

set -e

echo "📊 Deploying Prometheus & Grafana Monitoring Stack"
echo "=================================================="
echo ""

# Deploy Prometheus
echo "🔍 Deploying Prometheus..."
kubectl apply -f prometheus-config.yaml
kubectl apply -f prometheus-deployment.yaml

echo "⏳ Waiting for Prometheus to be ready..."
kubectl wait --for=condition=ready pod -l app=prometheus --timeout=120s

echo "✅ Prometheus is ready"
echo ""

# Deploy Grafana
echo "📈 Deploying Grafana..."
kubectl apply -f grafana-datasource.yaml
kubectl apply -f grafana-deployment.yaml

echo "⏳ Waiting for Grafana to be ready..."
kubectl wait --for=condition=ready pod -l app=grafana --timeout=120s

echo "✅ Grafana is ready"
echo ""

# Get URLs
echo "=================================================="
echo "✅ Monitoring Stack Deployed Successfully!"
echo "=================================================="
echo ""

echo "🔍 Prometheus URL:"
kubectl get service prometheus-service

echo ""
echo "📈 Grafana URL:"
kubectl get service grafana-service

echo ""
echo "=================================================="
echo "📝 Next Steps:"
echo "=================================================="
echo ""
echo "1. Get Prometheus URL:"
echo "   kubectl get service prometheus-service"
echo "   Access at: http://EXTERNAL-IP:9090"
echo ""
echo "2. Get Grafana URL:"
echo "   kubectl get service grafana-service"
echo "   Access at: http://EXTERNAL-IP:3000"
echo ""
echo "3. Login to Grafana:"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "4. Prometheus is already configured as datasource!"
echo ""
echo "5. Import Dashboard:"
echo "   - Go to Dashboards → Import"
echo "   - Use Dashboard ID: 1860 (Node Exporter Full)"
echo "   - Or create custom dashboard for WheelShare metrics"
echo ""
echo "📊 WheelShare Metrics Available at:"
echo "   http://BACKEND-IP:5000/metrics"
echo ""
echo "🎯 Key Metrics to Monitor:"
echo "   - nodejs_heap_size_used_bytes"
echo "   - nodejs_heap_size_total_bytes"
echo "   - process_cpu_user_seconds_total"
echo "   - http_request_duration_seconds"
echo "   - nodejs_eventloop_lag_seconds"
