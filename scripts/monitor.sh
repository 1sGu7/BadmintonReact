#!/bin/bash

# System Monitoring Script cho EC2 Free Tier
# Sử dụng: ./scripts/monitor.sh

set -e

# Configuration
LOG_FILE="/home/ubuntu/monitor.log"
ALERT_THRESHOLD_MEMORY=85  # Percentage
ALERT_THRESHOLD_DISK=80    # Percentage
ALERT_THRESHOLD_CPU=90     # Percentage

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "${BLUE}[HEADER]${NC} $1"
}

get_memory_usage() {
    local memory_info=$(free | grep Mem)
    local total=$(echo $memory_info | awk '{print $2}')
    local used=$(echo $memory_info | awk '{print $3}')
    local percentage=$((used * 100 / total))
    
    echo "$percentage"
}

get_disk_usage() {
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    echo "$disk_usage"
}

get_cpu_usage() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    echo "$cpu_usage"
}

check_docker_containers() {
    local containers=("badminton_mongodb" "badminton_backend" "badminton_frontend")
    local all_running=true
    
    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "$container"; then
            log_info "Container $container is running"
        else
            log_error "Container $container is not running"
            all_running=false
        fi
    done
    
    if [ "$all_running" = true ]; then
        return 0
    else
        return 1
    fi
}

check_docker_stats() {
    log_header "Docker Container Statistics"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"
}

check_system_resources() {
    log_header "System Resources"
    
    # Memory
    local memory_usage=$(get_memory_usage)
    echo "Memory Usage: ${memory_usage}%"
    if [ "$memory_usage" -gt "$ALERT_THRESHOLD_MEMORY" ]; then
        log_warn "Memory usage is high: ${memory_usage}%"
    fi
    
    # Disk
    local disk_usage=$(get_disk_usage)
    echo "Disk Usage: ${disk_usage}%"
    if [ "$disk_usage" -gt "$ALERT_THRESHOLD_DISK" ]; then
        log_warn "Disk usage is high: ${disk_usage}%"
    fi
    
    # CPU
    local cpu_usage=$(get_cpu_usage)
    echo "CPU Usage: ${cpu_usage}%"
    if [ "$cpu_usage" -gt "$ALERT_THRESHOLD_CPU" ]; then
        log_warn "CPU usage is high: ${cpu_usage}%"
    fi
    
    # Detailed memory info
    echo ""
    log_header "Detailed Memory Information"
    free -h
    
    # Detailed disk info
    echo ""
    log_header "Detailed Disk Information"
    df -h
}

check_application_health() {
    log_header "Application Health Check"
    
    # Check backend health
    if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
        log_info "Backend API is healthy"
    else
        log_error "Backend API is not responding"
    fi
    
    # Check frontend health
    if curl -f http://localhost:3000 > /dev/null 2>&1; then
        log_info "Frontend is healthy"
    else
        log_error "Frontend is not responding"
    fi
    
    # Check MongoDB connection
    if docker exec badminton_mongodb mongosh --username admin --password badminton123 --authenticationDatabase admin --eval "db.runCommand('ping')" > /dev/null 2>&1; then
        log_info "MongoDB is healthy"
    else
        log_error "MongoDB is not responding"
    fi
}

check_logs() {
    log_header "Recent Application Logs"
    
    # Show last 10 lines of each service
    echo "=== Backend Logs (last 10 lines) ==="
    docker-compose logs --tail=10 backend 2>/dev/null || echo "No backend logs available"
    
    echo ""
    echo "=== Frontend Logs (last 10 lines) ==="
    docker-compose logs --tail=10 frontend 2>/dev/null || echo "No frontend logs available"
    
    echo ""
    echo "=== MongoDB Logs (last 10 lines) ==="
    docker-compose logs --tail=10 mongodb 2>/dev/null || echo "No MongoDB logs available"
}

check_network() {
    log_header "Network Information"
    
    # Check open ports
    echo "Open ports:"
    netstat -tlnp 2>/dev/null | grep -E ':(80|443|3000|5000|27017|8080)' || echo "No relevant ports found"
    
    # Check Docker networks
    echo ""
    echo "Docker networks:"
    docker network ls
}

cleanup_old_logs() {
    log_header "Cleaning up old logs"
    
    # Clean Docker logs (keep last 100MB)
    docker system prune -f
    
    # Clean application logs older than 7 days
    find /home/ubuntu -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    log_info "Cleanup completed"
}

generate_report() {
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    echo "=========================================="
    echo "System Monitoring Report - $timestamp"
    echo "=========================================="
    echo ""
    
    check_system_resources
    echo ""
    
    check_docker_containers
    echo ""
    
    check_docker_stats
    echo ""
    
    check_application_health
    echo ""
    
    check_network
    echo ""
    
    check_logs
    echo ""
    
    cleanup_old_logs
    echo ""
    
    echo "=========================================="
    echo "Report completed at $(date)"
    echo "=========================================="
}

show_help() {
    echo "System Monitoring Script for EC2 Free Tier"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  report     Generate full monitoring report"
    echo "  resources  Check system resources only"
    echo "  docker     Check Docker containers only"
    echo "  health     Check application health only"
    echo "  logs       Show recent logs only"
    echo "  cleanup    Clean up old logs and Docker cache"
    echo "  help       Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 report"
    echo "  $0 resources"
    echo "  $0 docker"
}

# Main script
case "${1:-report}" in
    report)
        generate_report
        ;;
    resources)
        check_system_resources
        ;;
    docker)
        check_docker_containers
        check_docker_stats
        ;;
    health)
        check_application_health
        ;;
    logs)
        check_logs
        ;;
    cleanup)
        cleanup_old_logs
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac 