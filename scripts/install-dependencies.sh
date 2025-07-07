#!/bin/bash

# Badminton Web App - Install Dependencies Script
# Cài đặt Docker, Nginx và các dependencies cần thiết

set -e

echo "=== Badminton Web App - Install Dependencies ==="

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

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Docker
install_docker() {
    print_header "Installing Docker"
    
    if command_exists docker; then
        print_status "Docker is already installed"
        docker --version
        return 0
    fi
    
    print_status "Installing Docker..."
    
    # Update package index
    sudo apt update
    
    # Install prerequisites
    sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Add Docker repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Update package index again
    sudo apt update
    
    # Install Docker
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    sudo usermod -aG docker jenkins
    
    # Start and enable Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Verify installation
    if command_exists docker; then
        print_status "Docker installed successfully"
        docker --version
        return 0
    else
        print_error "Failed to install Docker"
        return 1
    fi
}

# Function to install Docker Compose
install_docker_compose() {
    print_header "Installing Docker Compose"
    
    if command_exists docker-compose; then
        print_status "Docker Compose is already installed"
        docker-compose --version
        return 0
    fi
    
    print_status "Installing Docker Compose..."
    
    # Download Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Make it executable
    sudo chmod +x /usr/local/bin/docker-compose
    
    # Verify installation
    if command_exists docker-compose; then
        print_status "Docker Compose installed successfully"
        docker-compose --version
        return 0
    else
        print_error "Failed to install Docker Compose"
        return 1
    fi
}

# Function to install Nginx
install_nginx() {
    print_header "Installing Nginx"
    
    if command_exists nginx; then
        print_status "Nginx is already installed"
        nginx -v
        return 0
    fi
    
    print_status "Installing Nginx..."
    
    # Update package index
    sudo apt update
    
    # Install Nginx
    sudo apt install -y nginx
    
    # Start and enable Nginx
    sudo systemctl start nginx
    sudo systemctl enable nginx
    
    # Configure firewall
    sudo ufw allow 'Nginx Full'
    
    # Verify installation
    if command_exists nginx; then
        print_status "Nginx installed successfully"
        nginx -v
        sudo systemctl status nginx --no-pager -l
        return 0
    else
        print_error "Failed to install Nginx"
        return 1
    fi
}

# Function to install Node.js
install_nodejs() {
    print_header "Installing Node.js"
    
    if command_exists node; then
        print_status "Node.js is already installed"
        node --version
        npm --version
        return 0
    fi
    
    print_status "Installing Node.js 18.x..."
    
    # Add NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    
    # Install Node.js
    sudo apt install -y nodejs
    
    # Verify installation
    if command_exists node; then
        print_status "Node.js installed successfully"
        node --version
        npm --version
        return 0
    else
        print_error "Failed to install Node.js"
        return 1
    fi
}

# Function to install additional tools
install_additional_tools() {
    print_header "Installing Additional Tools"
    
    # Install common tools
    sudo apt install -y curl wget git unzip software-properties-common \
        apt-transport-https ca-certificates gnupg lsb-release
    
    # Install Java (required for Jenkins)
    if ! command_exists java; then
        print_status "Installing Java..."
        sudo apt install -y openjdk-17-jdk
        java -version
    else
        print_status "Java is already installed"
        java -version
    fi
    
    print_status "Additional tools installed"
}

# Function to configure Docker for Jenkins
configure_docker_for_jenkins() {
    print_header "Configuring Docker for Jenkins"
    
    # Add jenkins user to docker group
    sudo usermod -aG docker jenkins
    
    # Restart Jenkins to apply changes
    if systemctl is-active --quiet jenkins; then
        print_status "Restarting Jenkins to apply Docker group changes..."
        sudo systemctl restart jenkins
        sleep 10
    fi
    
    # Test Docker access for jenkins user
    if sudo -u jenkins docker --version > /dev/null 2>&1; then
        print_status "Docker is accessible for Jenkins user"
    else
        print_warning "Docker may not be accessible for Jenkins user"
    fi
}

# Function to configure Nginx
configure_nginx() {
    print_header "Configuring Nginx"
    
    # Create backup of default configuration
    sudo cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup
    
    # Create basic configuration for badminton-web
    sudo tee /etc/nginx/sites-available/badminton-web > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Frontend routes
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Backend API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

    # Enable the configuration
    sudo ln -sf /etc/nginx/sites-available/badminton-web /etc/nginx/sites-enabled/
    sudo rm -f /etc/nginx/sites-enabled/default
    
    # Test configuration
    if sudo nginx -t; then
        print_status "Nginx configuration is valid"
        sudo systemctl reload nginx
    else
        print_error "Nginx configuration is invalid"
        return 1
    fi
}

# Function to create application directory
create_app_directory() {
    print_header "Creating Application Directory"
    
    # Create application directory
    sudo mkdir -p /opt/badminton-web
    sudo chown jenkins:jenkins /opt/badminton-web
    sudo chmod 755 /opt/badminton-web
    
    print_status "Application directory created: /opt/badminton-web"
}

# Function to verify installation
verify_installation() {
    print_header "Verifying Installation"
    
    local all_good=true
    
    # Check Docker
    if command_exists docker; then
        print_status "✅ Docker: $(docker --version)"
    else
        print_error "❌ Docker: Not installed"
        all_good=false
    fi
    
    # Check Docker Compose
    if command_exists docker-compose; then
        print_status "✅ Docker Compose: $(docker-compose --version)"
    else
        print_error "❌ Docker Compose: Not installed"
        all_good=false
    fi
    
    # Check Nginx
    if command_exists nginx; then
        print_status "✅ Nginx: $(nginx -v 2>&1)"
    else
        print_error "❌ Nginx: Not installed"
        all_good=false
    fi
    
    # Check Node.js
    if command_exists node; then
        print_status "✅ Node.js: $(node --version)"
    else
        print_error "❌ Node.js: Not installed"
        all_good=false
    fi
    
    # Check Java
    if command_exists java; then
        print_status "✅ Java: $(java -version 2>&1 | head -n 1)"
    else
        print_error "❌ Java: Not installed"
        all_good=false
    fi
    
    # Check Jenkins
    if systemctl is-active --quiet jenkins; then
        print_status "✅ Jenkins: Running"
    else
        print_warning "⚠️ Jenkins: Not running"
    fi
    
    if [ "$all_good" = true ]; then
        print_status "🎉 All dependencies installed successfully!"
        return 0
    else
        print_error "❌ Some dependencies failed to install"
        return 1
    fi
}

# Main execution
main() {
    print_header "Starting Dependencies Installation"
    
    # Update system
    print_status "Updating system packages..."
    sudo apt update && sudo apt upgrade -y
    
    # Install dependencies
    install_docker
    install_docker_compose
    install_nginx
    install_nodejs
    install_additional_tools
    
    # Configure services
    configure_docker_for_jenkins
    configure_nginx
    create_app_directory
    
    # Verify installation
    verify_installation
    
    print_header "Installation Summary"
    echo ""
    echo "✅ Docker and Docker Compose installed"
    echo "✅ Nginx installed and configured"
    echo "✅ Node.js installed"
    echo "✅ Java installed"
    echo "✅ Application directory created"
    echo ""
    echo "🌐 Nginx is running on port 80"
    echo "🐳 Docker is ready for containers"
    echo "📁 Application directory: /opt/badminton-web"
    echo ""
    echo "Next steps:"
    echo "1. Create Jenkins pipeline job"
    echo "2. Configure environment variables in Jenkins"
    echo "3. Run the pipeline to deploy the application"
    echo ""
    print_status "Dependencies installation completed!"
}

# Run main function
main "$@" 