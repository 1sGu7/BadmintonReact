pipeline {
    agent any
    
    environment {
        // Application configuration
        APP_NAME = 'badminton-web'
        APP_DIR = '/opt/badminton-web'
        DOCKER_IMAGE_NAME = 'badminton-frontend'
        DOCKER_CONTAINER_NAME = 'badminton-frontend'
        
        // Ports
        NGINX_PORT = '80'
        FRONTEND_PORT = '3000'
        
        // Environment variables (will be set from Jenkins)
        NODE_ENV = 'production'
        NEXT_PUBLIC_API_URL = 'http://localhost:5000/api'
        
        // Docker registry (optional)
        DOCKER_REGISTRY = ''
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    echo "=== Stage: Checkout ==="
                    
                    // Clean workspace
                    cleanWs()
                    
                    // Checkout code from Git
                    checkout scm
                    
                    // Display repository info
                    echo "Repository: ${env.GIT_URL}"
                    echo "Branch: ${env.GIT_BRANCH}"
                    echo "Commit: ${env.GIT_COMMIT}"
                }
            }
        }
        
        stage('Environment Setup') {
            steps {
                script {
                    echo "=== Stage: Environment Setup ==="
                    
                    // Create application directory
                    sh """
                        sudo mkdir -p ${APP_DIR}
                        sudo chown jenkins:jenkins ${APP_DIR}
                        sudo chmod 755 ${APP_DIR}
                    """
                    
                    // Copy application files
                    sh """
                        cp -r . ${APP_DIR}/
                        cd ${APP_DIR}
                        chmod +x scripts/*.sh
                    """
                    
                    // Create .env file from Jenkins environment variables
                    sh """
                        cat > ${APP_DIR}/.env << 'EOF'
# Application Configuration
NODE_ENV=${NODE_ENV}
NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# MongoDB Atlas Configuration
MONGODB_URI=\${MONGODB_URI}
MONGODB_DATABASE=\${MONGODB_DATABASE}

# JWT Configuration
JWT_SECRET=\${JWT_SECRET}

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=\${CLOUDINARY_CLOUD_NAME}
CLOUDINARY_API_KEY=\${CLOUDINARY_API_KEY}
CLOUDINARY_API_SECRET=\${CLOUDINARY_API_SECRET}

# Backend Configuration
BACKEND_PORT=5000
BACKEND_JWT_SECRET=\${JWT_SECRET}
BACKEND_CLOUDINARY_CLOUD_NAME=\${CLOUDINARY_CLOUD_NAME}
BACKEND_CLOUDINARY_API_KEY=\${CLOUDINARY_API_KEY}
BACKEND_CLOUDINARY_API_SECRET=\${CLOUDINARY_API_SECRET}

# Frontend Configuration
FRONTEND_NEXT_PUBLIC_API_URL=\${NEXT_PUBLIC_API_URL}
NEXT_TELEMETRY_DISABLED=1
EOF
                    """
                    
                    echo "Environment setup completed"
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    echo "=== Stage: Install Dependencies ==="
                    
                    // Install Docker if not installed
                    sh """
                        if ! command -v docker &> /dev/null; then
                            echo "Installing Docker..."
                            curl -fsSL https://get.docker.com -o get-docker.sh
                            sudo sh get-docker.sh
                            sudo usermod -aG docker jenkins
                            sudo systemctl start docker
                            sudo systemctl enable docker
                        else
                            echo "Docker is already installed"
                        fi
                    """
                    
                    // Install Nginx if not installed
                    sh """
                        if ! command -v nginx &> /dev/null; then
                            echo "Installing Nginx..."
                            sudo apt update
                            sudo apt install -y nginx
                            sudo systemctl start nginx
                            sudo systemctl enable nginx
                        else
                            echo "Nginx is already installed"
                        fi
                    """
                    
                    // Install Docker Compose if not installed
                    sh """
                        if ! command -v docker-compose &> /dev/null; then
                            echo "Installing Docker Compose..."
                            sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)" -o /usr/local/bin/docker-compose
                            sudo chmod +x /usr/local/bin/docker-compose
                        else
                            echo "Docker Compose is already installed"
                        fi
                    """
                    
                    // Restart Jenkins to apply Docker group
                    sh """
                        sudo systemctl restart jenkins
                        sleep 10
                    """
                    
                    echo "Dependencies installation completed"
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    echo "=== Stage: Security Scan ==="
                    
                    // Run npm audit for frontend
                    dir('frontend') {
                        sh """
                            npm audit --audit-level moderate || true
                        """
                    }
                    
                    // Run npm audit for backend
                    dir('backend') {
                        sh """
                            npm audit --audit-level moderate || true
                        """
                    }
                    
                    echo "Security scan completed"
                }
            }
        }
        
        stage('Build & Test') {
            steps {
                script {
                    echo "=== Stage: Build & Test ==="
                    
                    // Build frontend
                    dir('frontend') {
                        sh """
                            npm ci
                            npm run build
                        """
                    }
                    
                    // Build backend
                    dir('backend') {
                        sh """
                            npm ci
                        """
                    }
                    
                    echo "Build and test completed"
                }
            }
        }
        
        stage('Docker Build') {
            steps {
                script {
                    echo "=== Stage: Docker Build ==="
                    
                    // Build frontend Docker image
                    dir('frontend') {
                        sh """
                            docker build -t ${DOCKER_IMAGE_NAME}:latest .
                            docker tag ${DOCKER_IMAGE_NAME}:latest ${DOCKER_IMAGE_NAME}:${env.BUILD_NUMBER}
                        """
                    }
                    
                    // Build backend Docker image
                    dir('backend') {
                        sh """
                            docker build -t badminton-backend:latest .
                            docker tag badminton-backend:latest badminton-backend:${env.BUILD_NUMBER}
                        """
                    }
                    
                    echo "Docker build completed"
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    echo "=== Stage: Deploy ==="
                    
                    // Stop existing containers
                    sh """
                        cd ${APP_DIR}
                        docker-compose -f docker-compose.prod.yml down || true
                        docker stop ${DOCKER_CONTAINER_NAME} || true
                        docker rm ${DOCKER_CONTAINER_NAME} || true
                    """
                    
                    // Configure Nginx
                    sh """
                        sudo tee /etc/nginx/sites-available/${APP_NAME} > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;
    
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

    # Frontend routes
    location / {
        proxy_pass http://localhost:${FRONTEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
        
        # Cache static assets
        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            proxy_pass http://localhost:${FRONTEND_PORT};
        }
    }

    # Backend API routes
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\\n";
        add_header Content-Type text/plain;
    }
}

# Rate limiting
limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone \$binary_remote_addr zone=general:10m rate=30r/s;
EOF
                    """
                    
                    // Enable Nginx configuration
                    sh """
                        sudo ln -sf /etc/nginx/sites-available/${APP_NAME} /etc/nginx/sites-enabled/
                        sudo rm -f /etc/nginx/sites-enabled/default
                        sudo nginx -t
                        sudo systemctl reload nginx
                    """
                    
                    // Start Docker containers
                    sh """
                        cd ${APP_DIR}
                        docker-compose -f docker-compose.prod.yml up -d
                    """
                    
                    // Wait for containers to start
                    sh """
                        sleep 30
                        docker ps
                    """
                    
                    echo "Deploy completed"
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo "=== Stage: Health Check ==="
                    
                    // Wait for services to be ready
                    sh """
                        sleep 10
                    """
                    
                    // Check frontend health
                    sh """
                        curl -f http://localhost:${FRONTEND_PORT} || exit 1
                        echo "Frontend is healthy"
                    """
                    
                    // Check backend health
                    sh """
                        curl -f http://localhost:5000/api/health || exit 1
                        echo "Backend is healthy"
                    """
                    
                    // Check Nginx health
                    sh """
                        curl -f http://localhost/health || exit 1
                        echo "Nginx is healthy"
                    """
                    
                    // Get current IP
                    sh """
                        CURRENT_IP=\$(curl -s http://checkip.amazonaws.com/)
                        echo "Application is accessible at: http://\$CURRENT_IP"
                        echo "Health check: http://\$CURRENT_IP/health"
                    """
                    
                    echo "Health check completed"
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                script {
                    echo "=== Stage: Cleanup ==="
                    
                    // Remove old Docker images
                    sh """
                        docker image prune -f
                        docker system prune -f
                    """
                    
                    // Clean workspace
                    cleanWs()
                    
                    echo "Cleanup completed"
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "=== Pipeline Summary ==="
                echo "Build Number: ${env.BUILD_NUMBER}"
                echo "Build Status: ${currentBuild.result}"
                echo "Build Duration: ${currentBuild.durationString}"
                
                // Get current IP for easy access
                sh """
                    CURRENT_IP=\$(curl -s http://checkip.amazonaws.com/)
                    echo "Application URL: http://\$CURRENT_IP"
                    echo "Health Check: http://\$CURRENT_IP/health"
                    echo "Jenkins: http://\$CURRENT_IP:8080"
                """
            }
        }
        
        success {
            script {
                echo "✅ Pipeline completed successfully!"
                echo "🎉 Application is now running and accessible"
            }
        }
        
        failure {
            script {
                echo "❌ Pipeline failed!"
                echo "🔍 Check the logs above for details"
                
                // Show recent logs for debugging
                sh """
                    echo "Recent Docker logs:"
                    docker logs ${DOCKER_CONTAINER_NAME} --tail 20 || true
                    
                    echo "Recent Nginx logs:"
                    sudo tail -10 /var/log/nginx/error.log || true
                """
            }
        }
    }
} 