#!/bin/bash

# Badminton Web App - Start Application Script
# Hướng dẫn: https://github.com/your-username/badminton-web

set -e

echo "=== Badminton Web App - Start Application ==="

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

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Starting Docker..."
        sudo systemctl start docker
        sleep 5
    fi
    
    if docker info > /dev/null 2>&1; then
        print_status "Docker is running"
        return 0
    else
        print_error "Failed to start Docker"
        return 1
    fi
}

# Function to check if .env file exists
check_env_file() {
    if [ ! -f /opt/badminton-web/.env ]; then
        print_error ".env file not found"
        echo "Please create .env file from .env.example:"
        echo "cp /opt/badminton-web/.env.example /opt/badminton-web/.env"
        echo "Then edit the file with your configuration"
        return 1
    else
        print_status ".env file exists"
        return 0
    fi
}

# Function to check if application directory exists
check_app_directory() {
    if [ ! -d /opt/badminton-web ]; then
        print_error "Application directory not found"
        echo "Please run setup script first:"
        echo "/opt/badminton-web/scripts/setup-ec2.sh"
        return 1
    else
        print_status "Application directory exists"
        return 0
    fi
}

# Function to start Docker containers
start_containers() {
    print_header "Starting Docker Containers"
    
    cd /opt/badminton-web
    
    # Stop any existing containers
    print_status "Stopping existing containers..."
    docker-compose -f docker-compose.prod.yml down
    
    # Start containers
    print_status "Starting containers..."
    docker-compose -f docker-compose.prod.yml up -d
    
    # Wait for containers to start
    print_status "Waiting for containers to start..."
    sleep 30
    
    # Check container status
    print_status "Container status:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Function to check application health
check_health() {
    print_header "Health Check"
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        print_status "Health check attempt $attempt/$max_attempts"
        
        # Check backend health
        if curl -f -s http://localhost:5000/api/health > /dev/null; then
            print_status "Backend is healthy"
        else
            print_warning "Backend is not responding"
        fi
        
        # Check frontend health
        if curl -f -s http://localhost:3000 > /dev/null; then
            print_status "Frontend is healthy"
        else
            print_warning "Frontend is not responding"
        fi
        
        # Check Nginx health
        if curl -f -s http://localhost/health > /dev/null; then
            print_status "Nginx is healthy"
        else
            print_warning "Nginx is not responding"
        fi
        
        # If all services are healthy, break
        if curl -f -s http://localhost:5000/api/health > /dev/null && \
           curl -f -s http://localhost:3000 > /dev/null && \
           curl -f -s http://localhost/health > /dev/null; then
            print_status "All services are healthy!"
            return 0
        fi
        
        if [ $attempt -eq $max_attempts ]; then
            print_error "Health check failed after $max_attempts attempts"
            return 1
        fi
        
        print_status "Waiting 10 seconds before next attempt..."
        sleep 10
        attempt=$((attempt + 1))
    done
}

# Function to check Elastic IP
check_elastic_ip() {
    print_header "Elastic IP Check"
    
    if [ -f /opt/badminton-web/.elastic-ip ]; then
        source /opt/badminton-web/.elastic-ip
        current_ip=$(curl -s http://checkip.amazonaws.com/)
        
        if [ "$current_ip" = "$ELASTIC_IP" ]; then
            print_status "Elastic IP is correctly configured: $ELASTIC_IP"
            return 0
        else
            print_warning "IP mismatch. Current: $current_ip, Expected: $ELASTIC_IP"
            print_status "Running Elastic IP configuration..."
            /opt/badminton-web/scripts/configure-elastic-ip.sh
            return $?
        fi
    else
        print_warning "Elastic IP not configured"
        print_status "Running Elastic IP configuration..."
        /opt/badminton-web/scripts/configure-elastic-ip.sh
        return $?
    fi
}

# Function to display application URLs
display_urls() {
    print_header "Application URLs"
    
    if [ -f /opt/badminton-web/.elastic-ip ]; then
        source /opt/badminton-web/.elastic-ip
        echo "Frontend: http://$ELASTIC_IP"
        echo "Backend API: http://$ELASTIC_IP/api"
        echo "Health Check: http://$ELASTIC_IP/health"
    else
        current_ip=$(curl -s http://checkip.amazonaws.com/)
        echo "Frontend: http://$current_ip"
        echo "Backend API: http://$current_ip/api"
        echo "Health Check: http://$current_ip/health"
    fi
    
    echo "Jenkins: http://$(curl -s http://checkip.amazonaws.com/):8080"
    echo "Nginx Status: http://$(curl -s http://checkip.amazonaws.com/)/nginx_status"
}

# Function to show logs
show_logs() {
    print_header "Recent Logs"
    
    echo "Docker logs (last 10 lines):"
    docker-compose -f /opt/badminton-web/docker-compose.prod.yml logs --tail=10
    
    echo ""
    echo "Nginx logs (last 5 lines):"
    sudo tail -5 /var/log/nginx/error.log
}

# Function to restart services
restart_services() {
    print_header "Restarting Services"
    
    # Restart Nginx
    print_status "Restarting Nginx..."
    sudo systemctl restart nginx
    
    # Restart Docker containers
    print_status "Restarting Docker containers..."
    cd /opt/badminton-web
    docker-compose -f docker-compose.prod.yml restart
    
    # Wait for services to start
    sleep 10
}

# Main execution
main() {
    case "$1" in
        "start")
            # Check prerequisites
            check_app_directory || exit 1
            check_env_file || exit 1
            check_docker || exit 1
            
            # Start application
            start_containers
            check_health
            check_elastic_ip
            display_urls
            ;;
        "restart")
            restart_services
            check_health
            display_urls
            ;;
        "health")
            check_health
            ;;
        "logs")
            show_logs
            ;;
        "urls")
            display_urls
            ;;
        "elastic")
            check_elastic_ip
            ;;
        "status")
            print_header "Application Status"
            docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
            echo ""
            check_health
            ;;
        *)
            echo "Usage: $0 [command]"
            echo ""
            echo "Commands:"
            echo "  start     - Start the application"
            echo "  restart   - Restart all services"
            echo "  health    - Check application health"
            echo "  logs      - Show recent logs"
            echo "  urls      - Display application URLs"
            echo "  elastic   - Check/configure Elastic IP"
            echo "  status    - Show application status"
            echo ""
            echo "Examples:"
            echo "  $0 start"
            echo "  $0 health"
            echo "  $0 logs"
            exit 1
            ;;
    esac
}

# Run main function
main $1 