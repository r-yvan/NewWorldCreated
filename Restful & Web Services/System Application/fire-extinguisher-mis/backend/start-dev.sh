#!/bin/bash

# Development startup script for FEMS microservices
# This script starts all services in the background and provides management commands

set -e

SERVICES=("api-gateway" "auth-service" "user-service" "extinguisher-service" "inspection-service" "maintenance-service" "reporting-service")
PORTS=(5000 5001 5002 5003 5004 5005 5006)
PIDS_FILE=".dev-pids"

start_services() {
    echo "🚀 Starting FEMS microservices..."
    
    # Clear previous PIDs
    > "$PIDS_FILE"
    
    for i in "${!SERVICES[@]}"; do
        service="${SERVICES[$i]}"
        port="${PORTS[$i]}"
        
        echo "  ▶ Starting $service on port $port..."
        cd "$service"
        bun run dev > "../logs/${service}.log" 2>&1 &
        pid=$!
        echo "$service:$pid:$port" >> "../$PIDS_FILE"
        cd ..
        sleep 1
    done
    
    echo ""
    echo "✅ All services started!"
    echo ""
    echo "📊 Service Status:"
    cat "$PIDS_FILE" | while IFS=: read -r service pid port; do
        echo "   $service - PID: $pid - Port: $port"
    done
    echo ""
    echo "🔍 Logs: tail -f logs/<service-name>.log"
    echo "🛑 Stop: ./start-dev.sh stop"
    echo "📡 Gateway: http://localhost:5000"
    echo "❤️  Health: http://localhost:5000/health"
}

stop_services() {
    if [ ! -f "$PIDS_FILE" ]; then
        echo "❌ No running services found (no $PIDS_FILE)"
        exit 1
    fi
    
    echo "🛑 Stopping FEMS microservices..."
    
    cat "$PIDS_FILE" | while IFS=: read -r service pid port; do
        if ps -p "$pid" > /dev/null 2>&1; then
            echo "  ⏹ Stopping $service (PID: $pid)..."
            kill "$pid" 2>/dev/null || true
        else
            echo "  ⚠ $service (PID: $pid) not running"
        fi
    done
    
    rm -f "$PIDS_FILE"
    echo ""
    echo "✅ All services stopped"
}

status_services() {
    if [ ! -f "$PIDS_FILE" ]; then
        echo "❌ No services running (no $PIDS_FILE)"
        exit 1
    fi
    
    echo "📊 FEMS Microservices Status:"
    echo ""
    
    cat "$PIDS_FILE" | while IFS=: read -r service pid port; do
        if ps -p "$pid" > /dev/null 2>&1; then
            status="✅ Running"
            health=$(curl -s "http://localhost:$port/health" 2>/dev/null | grep -o '"status":"[^"]*"' || echo "❓ No response")
        else
            status="❌ Stopped"
            health="N/A"
        fi
        printf "%-25s PID: %-8s Port: %-6s Status: %-12s Health: %s\n" "$service" "$pid" "$port" "$status" "$health"
    done
}

logs_service() {
    service=$1
    if [ -z "$service" ]; then
        echo "Usage: ./start-dev.sh logs <service-name>"
        echo "Available services: ${SERVICES[*]}"
        exit 1
    fi
    
    log_file="logs/${service}.log"
    if [ ! -f "$log_file" ]; then
        echo "❌ Log file not found: $log_file"
        exit 1
    fi
    
    echo "📜 Tailing logs for $service (Ctrl+C to exit)..."
    tail -f "$log_file"
}

case "$1" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        stop_services
        sleep 2
        start_services
        ;;
    status)
        status_services
        ;;
    logs)
        logs_service "$2"
        ;;
    *)
        echo "FEMS Microservices Development Manager"
        echo ""
        echo "Usage: ./start-dev.sh {start|stop|restart|status|logs}"
        echo ""
        echo "Commands:"
        echo "  start    - Start all microservices in background"
        echo "  stop     - Stop all running microservices"
        echo "  restart  - Restart all microservices"
        echo "  status   - Show status of all services"
        echo "  logs     - Tail logs for a service (e.g., logs api-gateway)"
        echo ""
        echo "Services: ${SERVICES[*]}"
        exit 1
        ;;
esac
