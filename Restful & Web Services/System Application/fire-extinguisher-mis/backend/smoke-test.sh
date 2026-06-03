#!/bin/bash

# Smoke test script for FEMS microservices
# Tests that each service can start and respond to health checks

set -e

SERVICES=("api-gateway" "auth-service" "user-service" "extinguisher-service" "inspection-service" "maintenance-service" "reporting-service")
PORTS=(5000 5001 5002 5003 5004 5005 5006)

echo "🧪 FEMS Microservices Smoke Test"
echo "================================"
echo ""

# Check prerequisites
echo "📋 Checking prerequisites..."

if ! command -v bun &> /dev/null; then
    echo "❌ Bun is not installed"
    exit 1
fi
echo "✅ Bun installed: $(bun --version)"

if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL client not in PATH (optional)"
else
    echo "✅ PostgreSQL client available"
fi

echo ""
echo "📦 Checking service directories..."

for service in "${SERVICES[@]}"; do
    if [ ! -d "$service" ]; then
        echo "❌ Service directory missing: $service"
        exit 1
    fi
    
    if [ ! -f "$service/package.json" ]; then
        echo "❌ package.json missing in $service"
        exit 1
    fi
    
    if [ ! -f "$service/.env" ]; then
        echo "⚠️  .env file missing in $service (will use defaults)"
    fi
    
    if [ ! -d "$service/node_modules" ]; then
        echo "❌ node_modules missing in $service - run 'bun install'"
        exit 1
    fi
    
    echo "✅ $service - structure OK"
done

echo ""
echo "🔍 Testing TypeScript compilation..."

for service in "${SERVICES[@]}"; do
    echo -n "  Checking $service... "
    cd "$service"
    if bunx tsc --noEmit 2>&1 | grep -i error > /dev/null; then
        echo "❌ FAILED"
        bunx tsc --noEmit
        cd ..
        exit 1
    else
        echo "✅ PASS"
    fi
    cd ..
done

echo ""
echo "🚀 Testing service startup (sequential)..."
echo "   (Each service will start, health check, then stop)"
echo ""

for i in "${!SERVICES[@]}"; do
    service="${SERVICES[$i]}"
    port="${PORTS[$i]}"
    
    echo "  Testing $service (port $port)..."
    
    # Start service in background
    cd "$service"
    bun run start > /tmp/fems-smoke-${service}.log 2>&1 &
    pid=$!
    cd ..
    
    # Wait for service to start (max 10 seconds)
    echo -n "    Waiting for startup..."
    for j in {1..20}; do
        if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
            echo " ✅ Started"
            break
        fi
        if [ $j -eq 20 ]; then
            echo " ❌ TIMEOUT"
            echo "    Check logs: tail /tmp/fems-smoke-${service}.log"
            kill $pid 2>/dev/null || true
            exit 1
        fi
        sleep 0.5
    done
    
    # Health check
    echo -n "    Health check... "
    health=$(curl -s "http://localhost:$port/health")
    if echo "$health" | grep -q '"success":true' || echo "$health" | grep -q '"status":"ok"'; then
        echo "✅ Healthy"
    else
        echo "❌ Unhealthy response: $health"
        kill $pid 2>/dev/null || true
        exit 1
    fi
    
    # Stop service
    echo "    Stopping..."
    kill $pid 2>/dev/null || true
    wait $pid 2>/dev/null || true
    
    # Clean up port (wait for it to be released)
    sleep 1
    
    echo "  ✅ $service PASSED"
    echo ""
done

echo "================================"
echo "✅ All smoke tests PASSED!"
echo ""
echo "Next steps:"
echo "  1. Start all services: ./start-dev.sh start"
echo "  2. Check status: ./start-dev.sh status"
echo "  3. Test API: curl http://localhost:5000/health"
echo "  4. Stop services: ./start-dev.sh stop"
echo ""
echo "Or use Docker:"
echo "  docker compose up --build"
