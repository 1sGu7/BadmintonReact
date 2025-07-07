#!/bin/bash

# Badminton Web App - EC2 Setup Script
# Ubuntu 24.04 LTS
# Cài đặt Docker, Node.js, Jenkins, Nginx

set -e

echo "=== Badminton Web App - EC2 Setup Script ==="
echo "Starting installation on $(date)"
echo ""

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

# Install basic dependencies
print_status "Installing basic dependencies..."
sudo apt install -y curl wget git unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release

# Install Java (Required for Jenkins)
print_status "Installing Java 17..."
sudo apt install -y openjdk-17-jdk
java -version

# Install Docker
print_status "Installing Docker..."
# Add Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Add Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Add current user to docker group
sudo usermod -aG docker $USER

# Start and enable Docker
sudo systemctl start docker
sudo systemctl enable docker

# Verify Docker installation
docker --version
docker-compose --version

# Install Node.js 18.x
print_status "Installing Node.js 18.x..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Install Jenkins
print_status "Installing Jenkins..."
# Add Jenkins repository
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee \
  /usr/share/keyrings/jenkins-keyring.asc > /dev/null

echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/ | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# Install Jenkins
sudo apt update
sudo apt install -y jenkins

# Add jenkins user to docker group
sudo usermod -aG docker jenkins

# Start and enable Jenkins
sudo systemctl start jenkins
sudo systemctl enable jenkins

# Install Nginx (Optional)
print_status "Installing Nginx..."
sudo apt install -y nginx
sudo systemctl start nginx
sudo systemctl enable nginx

# Configure firewall
print_status "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw allow 5000/tcp
sudo ufw allow 3000/tcp

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p /opt/badminton-web
sudo chown $USER:$USER /opt/badminton-web

# Create backup directory
sudo mkdir -p /opt/backups/badminton-web
sudo chown $USER:$USER /opt/backups/badminton-web

# Create logs directory
sudo mkdir -p /opt/badminton-web/logs
sudo chown $USER:$USER /opt/badminton-web/logs

# Create monitoring script
print_status "Creating monitoring script..."
cat > /opt/badminton-web/scripts/monitor.sh << 'EOF'
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
EOF

chmod +x /opt/badminton-web/scripts/monitor.sh

# Create backup script
print_status "Creating backup script..."
cat > /opt/badminton-web/scripts/backup.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/opt/backups/badminton-web"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MongoDB
docker exec badminton_mongodb mongodump --out /backup/$DATE

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /opt/badminton-web

# Clean old backups (keep last 7 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/app_$DATE.tar.gz"
EOF

chmod +x /opt/badminton-web/scripts/backup.sh

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
    create 644 ubuntu ubuntu
}
EOF

# Create systemd service for monitoring
print_status "Creating systemd service for monitoring..."
sudo tee /etc/systemd/system/badminton-monitor.service > /dev/null << 'EOF'
[Unit]
Description=Badminton Web App Monitoring
After=network.target

[Service]
Type=oneshot
User=ubuntu
ExecStart=/opt/badminton-web/scripts/monitor.sh
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# Create systemd timer for monitoring
sudo tee /etc/systemd/system/badminton-monitor.timer > /dev/null << 'EOF'
[Unit]
Description=Run Badminton Web App monitoring every 5 minutes
Requires=badminton-monitor.service

[Timer]
Unit=badminton-monitor.service
OnCalendar=*:0/5
Persistent=true

[Install]
WantedBy=timers.target
EOF

# Enable monitoring timer
sudo systemctl enable badminton-monitor.timer
sudo systemctl start badminton-monitor.timer

# Create cleanup script
print_status "Creating cleanup script..."
cat > /opt/badminton-web/scripts/cleanup.sh << 'EOF'
#!/bin/bash

echo "Cleaning up Docker resources..."

# Remove unused containers
docker container prune -f

# Remove unused images
docker image prune -f

# Remove unused volumes
docker volume prune -f

# Remove unused networks
docker network prune -f

# Clean npm cache
npm cache clean --force

echo "Cleanup completed!"
EOF

chmod +x /opt/badminton-web/scripts/cleanup.sh

# Create crontab for automatic cleanup
print_status "Setting up automatic cleanup..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/badminton-web/scripts/cleanup.sh") | crontab -

# Display installation summary
print_status "Installation completed successfully!"
echo ""
echo "=== Installation Summary ==="
echo "✅ Docker: $(docker --version)"
echo "✅ Node.js: $(node --version)"
echo "✅ NPM: $(npm --version)"
echo "✅ Jenkins: Installed and running"
echo "✅ Nginx: Installed and running"
echo "✅ Firewall: Configured"
echo ""
echo "=== Next Steps ==="
echo "1. Get Jenkins initial password:"
echo "   sudo cat /var/lib/jenkins/secrets/initialAdminPassword"
echo ""
echo "2. Access Jenkins at: http://$(curl -s ifconfig.me):8080"
echo ""
echo "3. Clone your repository:"
echo "   cd /opt/badminton-web"
echo "   git clone https://github.com/your-username/badminton-web.git ."
echo ""
echo "4. Configure Jenkins environment variables (see JENKINS_ENV_SETUP.md)"
echo ""
echo "5. Set up GitHub webhook (see EC2_DEPLOYMENT_GUIDE.md)"
echo ""
echo "=== Useful Commands ==="
echo "• Check system status: /opt/badminton-web/scripts/monitor.sh"
echo "• Create backup: /opt/badminton-web/scripts/backup.sh"
echo "• Clean up resources: /opt/badminton-web/scripts/cleanup.sh"
echo "• View Jenkins logs: sudo tail -f /var/log/jenkins/jenkins.log"
echo "• Restart Jenkins: sudo systemctl restart jenkins"
echo "• Check Docker containers: docker ps"
echo ""
echo "=== Security Notes ==="
echo "⚠️  Change default passwords"
echo "⚠️  Configure SSL certificates"
echo "⚠️  Set up regular backups"
echo "⚠️  Monitor system resources"
echo ""
print_status "Setup completed! Please reboot the system to apply all changes."
echo "Run: sudo reboot" 