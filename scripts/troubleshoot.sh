#!/bin/bash

# Badminton Web App - Troubleshooting Script
# Hướng dẫn: https://github.com/your-username/badminton-web

set -e

echo "=== Badminton Web App - Troubleshooting ==="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

# Function to check service status
check_service() {
    local service=$1
    local name=$2
    
    if systemctl is-active --quiet $service; then
        print_status "$name is running"
        return 0
    else
        print_error "$name is not running"
        return 1
    fi
}

# Function to check port
check_port() {
    local port=$1
    local name=$2
    
    if netstat -tlnp | grep -q ":$port "; then
        print_status "$name is listening on port $port"
        return 0
    else
        print_error "$name is not listening on port $port"
        return 1
    fi
}

# Function to check Docker container
check_container() {
    local container=$1
    local name=$2
    
    if docker ps | grep -q $container; then
        print_status "$name container is running"
        return 0
    else
        print_error "$name container is not running"
        return 1
    fi
}

# Function to check URL
check_url() {
    local url=$1
    local name=$2
    
    if curl -f -s $url > /dev/null; then
        print_status "$name is accessible at $url"
        return 0
    else
        print_error "$name is not accessible at $url"
        return 1
    fi
}

# Function to check disk space
check_disk_space() {
    print_header "Disk Space Check"
    
    df -h | grep -E '^/dev/' | while read line; do
        usage=$(echo $line | awk '{print $5}' | sed 's/%//')
        partition=$(echo $line | awk '{print $1}')
        if [ $usage -gt 80 ]; then
            print_warning "High disk usage on $partition: ${usage}%"
        else
            print_status "Disk usage on $partition: ${usage}%"
        fi
    done
}

# Function to check memory usage
check_memory_usage() {
    print_header "Memory Usage Check"
    
    free -h | grep -E '^Mem:' | while read line; do
        total=$(echo $line | awk '{print $2}')
        used=$(echo $line | awk '{print $3}')
        available=$(echo $line | awk '{print $7}')
        
        print_status "Memory: $used used, $available available, $total total"
    done
}

# Function to check Docker resources
check_docker_resources() {
    print_header "Docker Resources Check"
    
    # Check running containers
    print_status "Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    # Check Docker disk usage
    print_status "Docker disk usage:"
    docker system df
    
    # Check Docker volumes
    print_status "Docker volumes:"
    docker volume ls
}

# Function to check application logs
check_application_logs() {
    print_header "Application Logs Check"
    
    # Check Nginx logs
    if [ -f /var/log/nginx/error.log ]; then
        print_status "Recent Nginx errors:"
        sudo tail -5 /var/log/nginx/error.log
    fi
    
    # Check Docker logs
    print_status "Recent Docker logs:"
    docker-compose -f /opt/badminton-web/docker-compose.prod.yml logs --tail=10
}

# Function to check network connectivity
check_network() {
    print_header "Network Connectivity Check"
    
    # Check if we can reach external services
    if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
        print_status "Internet connectivity: OK"
    else
        print_error "Internet connectivity: FAILED"
    fi
    
    # Check DNS resolution
    if nslookup google.com > /dev/null 2>&1; then
        print_status "DNS resolution: OK"
    else
        print_error "DNS resolution: FAILED"
    fi
    
    # Check current IP
    current_ip=$(curl -s http://checkip.amazonaws.com/)
    print_status "Current public IP: $current_ip"
}

# Function to check security groups
check_security_groups() {
    print_header "Security Group Check"
    
    # Check if required ports are open
    local ports=(22 80 443 8080 5000 3000)
    
    for port in "${ports[@]}"; do
        if netstat -tlnp | grep -q ":$port "; then
            print_status "Port $port is open"
        else
            print_warning "Port $port is not open"
        fi
    done
}

# Function to check environment variables
check_environment() {
    print_header "Environment Variables Check"
    
    if [ -f /opt/badminton-web/.env ]; then
        print_status ".env file exists"
        
        # Check required variables
        local required_vars=(
            "MONGODB_ROOT_USERNAME"
            "MONGODB_ROOT_PASSWORD"
            "BACKEND_JWT_SECRET"
            "FRONTEND_NEXT_PUBLIC_API_URL"
        )
        
        for var in "${required_vars[@]}"; do
            if grep -q "^$var=" /opt/badminton-web/.env; then
                print_status "$var is set"
            else
                print_error "$var is not set"
            fi
        done
    else
        print_error ".env file not found"
    fi
}

# Function to check Elastic IP
check_elastic_ip() {
    print_header "Elastic IP Check"
    
    if [ -f /opt/badminton-web/.elastic-ip ]; then
        source /opt/badminton-web/.elastic-ip
        print_status "Elastic IP: $ELASTIC_IP"
        print_status "Allocation ID: $ALLOCATION_ID"
        
        # Check if AWS CLI is available
        if command -v aws &> /dev/null; then
            # Check if IP is still associated
            current_ip=$(curl -s http://checkip.amazonaws.com/)
            if [ "$current_ip" = "$ELASTIC_IP" ]; then
                print_status "Elastic IP is correctly associated"
            else
                print_warning "Elastic IP mismatch. Current: $current_ip, Expected: $ELASTIC_IP"
            fi
        fi
    else
        print_warning "Elastic IP configuration not found"
    fi
}

# Function to provide fixes
provide_fixes() {
    print_header "Suggested Fixes"
    
    echo ""
    echo "If you found issues, here are some common fixes:"
    echo ""
    echo "1. Restart services:"
    echo "   sudo systemctl restart nginx"
    echo "   sudo systemctl restart jenkins"
    echo "   docker-compose -f /opt/badminton-web/docker-compose.prod.yml restart"
    echo ""
    echo "2. Check Docker containers:"
    echo "   docker ps -a"
    echo "   docker logs <container_name>"
    echo ""
    echo "3. Check Nginx configuration:"
    echo "   sudo nginx -t"
    echo "   sudo systemctl status nginx"
    echo ""
    echo "4. Check Jenkins:"
    echo "   sudo systemctl status jenkins"
    echo "   sudo tail -f /var/log/jenkins/jenkins.log"
    echo ""
    echo "5. Update Elastic IP:"
    echo "   /opt/badminton-web/scripts/configure-elastic-ip.sh"
    echo ""
    echo "6. Clean up Docker:"
    echo "   docker system prune -f"
    echo "   docker volume prune -f"
    echo ""
    echo "7. Check disk space:"
    echo "   df -h"
    echo "   du -sh /var/lib/docker"
    echo ""
}

# Function to run health check
run_health_check() {
    print_header "Health Check"
    
    # Check services
    check_service "nginx" "Nginx"
    check_service "jenkins" "Jenkins"
    check_service "docker" "Docker"
    
    # Check ports
    check_port "80" "Nginx"
    check_port "8080" "Jenkins"
    check_port "3000" "Frontend"
    check_port "5000" "Backend"
    
    # Check containers
    check_container "badminton_frontend" "Frontend"
    check_container "badminton_backend" "Backend"
    check_container "badminton_mongodb" "MongoDB"
    
    # Check URLs
    check_url "http://localhost" "Frontend via Nginx"
    check_url "http://localhost:3000" "Frontend direct"
    check_url "http://localhost:5000/api/health" "Backend API"
    check_url "http://localhost/health" "Nginx health"
}

# Main execution
main() {
    case "$1" in
        "health")
            run_health_check
            ;;
        "disk")
            check_disk_space
            ;;
        "memory")
            check_memory_usage
            ;;
        "docker")
            check_docker_resources
            ;;
        "logs")
            check_application_logs
            ;;
        "network")
            check_network
            ;;
        "security")
            check_security_groups
            ;;
        "env")
            check_environment
            ;;
        "elastic")
            check_elastic_ip
            ;;
        "all")
            run_health_check
            echo ""
            check_disk_space
            echo ""
            check_memory_usage
            echo ""
            check_docker_resources
            echo ""
            check_network
            echo ""
            check_environment
            echo ""
            check_elastic_ip
            echo ""
            provide_fixes
            ;;
        *)
            echo "Usage: $0 [option]"
            echo ""
            echo "Options:"
            echo "  health    - Run health check"
            echo "  disk      - Check disk space"
            echo "  memory    - Check memory usage"
            echo "  docker    - Check Docker resources"
            echo "  logs      - Check application logs"
            echo "  network   - Check network connectivity"
            echo "  security  - Check security groups"
            echo "  env       - Check environment variables"
            echo "  elastic   - Check Elastic IP"
            echo "  all       - Run all checks"
            echo ""
            echo "Examples:"
            echo "  $0 health"
            echo "  $0 all"
            exit 1
            ;;
    esac
}

# Run main function
main $1 