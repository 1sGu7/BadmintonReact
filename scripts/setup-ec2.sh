#!/bin/bash

# Badminton Web App - EC2 Setup Script
# Hướng dẫn: https://github.com/your-username/badminton-web

set -e

echo "=== Badminton Web App EC2 Setup ==="
echo "Starting setup process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Update system
print_status "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install required packages
print_status "Installing required packages..."
sudo apt install -y curl wget git unzip software-properties-common \
    apt-transport-https ca-certificates gnupg lsb-release \
    nginx openjdk-17-jdk

# Install Docker
print_status "Installing Docker..."
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add user to docker group
sudo usermod -aG docker $USER
sudo usermod -aG docker jenkins

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Install Node.js
print_status "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Jenkins
print_status "Installing Jenkins..."
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

sudo apt update
sudo apt install -y jenkins

# Start and enable Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Configure Nginx
print_status "Configuring Nginx..."

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/badminton-web > /dev/null <<'EOF'
# Cấu hình Nginx cho Badminton Web App
server {
    listen 80;
    server_name _;  # Chấp nhận tất cả domain/IP
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # Frontend routes - serve static files from Next.js build
    location / {
        limit_req zone=general burst=20 nodelay;
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
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://localhost:3000;
        }
    }

    # Backend API routes
    location /api/ {
        limit_req zone=api burst=10 nodelay;
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

    # Nginx status (optional)
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
}

# Rate limiting configuration
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=general:10m rate=30r/s;
EOF

# Enable Nginx configuration
sudo ln -sf /etc/nginx/sites-available/badminton-web /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx

# Create application directory
print_status "Setting up application directory..."
sudo mkdir -p /opt/badminton-web
sudo chown $USER:$USER /opt/badminton-web

# Create environment file template
print_status "Creating environment file template..."
cat > /opt/badminton-web/.env.example << 'EOF'
# MongoDB Configuration
MONGODB_ROOT_USERNAME=admin
MONGODB_ROOT_PASSWORD=your-secure-mongodb-password
MONGODB_DATABASE=badminton_shop

# Backend Configuration
BACKEND_JWT_SECRET=your-super-secret-jwt-key-min-32-characters
BACKEND_CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
BACKEND_CLOUDINARY_API_KEY=your-cloudinary-api-key
BACKEND_CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# Frontend Configuration
FRONTEND_NEXT_PUBLIC_API_URL=http://your-elastic-ip/api
EOF

# Create monitoring script
print_status "Creating monitoring script..."
sudo mkdir -p /opt/badminton-web/scripts
sudo tee /opt/badminton-web/scripts/monitor.sh > /dev/null << 'EOF'
#!/bin/bash

# Health check script
echo "=== Health Check $(date) ==="

# Check Docker containers
echo "Docker containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Check disk usage
echo "Disk usage:"
df -h

# Check memory usage
echo "Memory usage:"
free -h

# Check application health
echo "Application health:"
curl -f http://localhost:5000/api/health && echo "Backend: OK" || echo "Backend: FAILED"
curl -f http://localhost:3000 && echo "Frontend: OK" || echo "Frontend: FAILED"
curl -f http://localhost && echo "Nginx: OK" || echo "Nginx: FAILED"

# Check Nginx status
echo "Nginx status:"
sudo systemctl status nginx --no-pager -l

# Check Elastic IP
echo "Current IP:"
curl -s http://checkip.amazonaws.com/
EOF

sudo chmod +x /opt/badminton-web/scripts/monitor.sh

# Create backup script
print_status "Creating backup script..."
sudo tee /opt/badminton-web/scripts/backup.sh > /dev/null << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups/badminton-web"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec badminton_mongodb mongodump --out /backup/$DATE

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/badminton-web

# Backup Nginx config
tar -czf $BACKUP_DIR/nginx_$DATE.tar.gz /etc/nginx

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
EOF

sudo chmod +x /opt/badminton-web/scripts/backup.sh

# Configure log rotation
print_status "Configuring log rotation..."
sudo tee /etc/logrotate.d/badminton-web > /dev/null << 'EOF'
/opt/badminton-web/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    create 644 jenkins jenkins
}

/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
EOF

# Get Jenkins initial password
print_status "Setup completed successfully!"
echo ""
echo "=== Next Steps ==="
echo "1. Get Jenkins initial password:"
echo "   sudo cat /var/lib/jenkins/secrets/initialAdminPassword"
echo ""
echo "2. Configure Elastic IP in AWS Console"
echo "3. Update .env file with your configuration"
echo "4. Clone your repository to /opt/badminton-web"
echo "5. Run docker-compose -f docker-compose.prod.yml up -d"
echo ""
echo "=== URLs ==="
echo "Jenkins: http://$(curl -s http://checkip.amazonaws.com/):8080"
echo "Application: http://$(curl -s http://checkip.amazonaws.com/)"
echo "Health Check: http://$(curl -s http://checkip.amazonaws.com/)/health"
echo ""
print_status "Setup completed! Please follow the next steps above." 