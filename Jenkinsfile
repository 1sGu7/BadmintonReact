pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE_BACKEND = 'badminton-backend'
        DOCKER_IMAGE_FRONTEND = 'badminton-frontend'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
        DOCKER_REGISTRY = "${env.DOCKER_REGISTRY ?: 'localhost:5000'}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Environment Setup') {
            steps {
                script {
                    // Create .env files from Jenkins environment variables
                    sh '''
                        # Backend .env
                        cat > backend/.env << EOF
                        PORT=${PORT}
                        NODE_ENV=${NODE_ENV}
                        MONGODB_URI=${MONGODB_URI}
                        JWT_SECRET=${JWT_SECRET}
                        ENCRYPTION_KEY=${ENCRYPTION_KEY}
                        CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
                        CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
                        CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
                        FRONTEND_URL=${FRONTEND_URL}
                        EOF
                        
                        # Frontend .env.local
                        cat > frontend/.env.local << EOF
                        NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
                        NEXT_TELEMETRY_DISABLED=1
                        EOF
                        
                        # Docker Compose .env
                        cat > .env << EOF
                        MONGODB_ROOT_USERNAME=${MONGODB_ROOT_USERNAME}
                        MONGODB_ROOT_PASSWORD=${MONGODB_ROOT_PASSWORD}
                        MONGODB_DATABASE=${MONGODB_DATABASE}
                        BACKEND_JWT_SECRET=${JWT_SECRET}
                        BACKEND_CLOUDINARY_CLOUD_NAME=${CLOUDINARY_CLOUD_NAME}
                        BACKEND_CLOUDINARY_API_KEY=${CLOUDINARY_API_KEY}
                        BACKEND_CLOUDINARY_API_SECRET=${CLOUDINARY_API_SECRET}
                        FRONTEND_NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
                        EOF
                    '''
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Backend Dependencies') {
                    steps {
                        dir('backend') {
                            sh 'npm ci --only=production'
                        }
                    }
                }
                stage('Frontend Dependencies') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            steps {
                script {
                    // Run security audit
                    sh '''
                        echo "Running security audit..."
                        cd backend && npm audit --audit-level=moderate || true
                        cd ../frontend && npm audit --audit-level=moderate || true
                    '''
                }
            }
        }
        
        stage('Build & Test') {
            parallel {
                stage('Backend Build') {
                    steps {
                        dir('backend') {
                            sh 'npm run build || echo "No build script found"'
                        }
                    }
                }
                stage('Frontend Build') {
                    steps {
                        dir('frontend') {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
        
        stage('Docker Build') {
            parallel {
                stage('Build Backend Image') {
                    steps {
                        script {
                            docker.build("${DOCKER_IMAGE_BACKEND}:${DOCKER_TAG}", "./backend")
                            if (env.DOCKER_REGISTRY != 'localhost:5000') {
                                docker.image("${DOCKER_IMAGE_BACKEND}:${DOCKER_TAG}").push()
                            }
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        script {
                            docker.build("${DOCKER_IMAGE_FRONTEND}:${DOCKER_TAG}", "./frontend")
                            if (env.DOCKER_REGISTRY != 'localhost:5000') {
                                docker.image("${DOCKER_IMAGE_FRONTEND}:${DOCKER_TAG}").push()
                            }
                        }
                    }
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    // Stop existing containers
                    sh 'docker-compose down || true'
                    
                    // Remove old images to save space
                    sh 'docker image prune -f || true'
                    
                    // Start services with new images
                    sh 'docker-compose up -d --build'
                    
                    // Wait for services to be healthy
                    sh '''
                        echo "Waiting for services to be ready..."
                        timeout 300 bash -c 'until docker-compose ps | grep -q "healthy"; do sleep 10; done'
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    // Wait for services to be ready
                    sleep 30
                    
                    // Check backend health
                    sh '''
                        curl -f http://localhost:5000/api/health || exit 1
                        echo "Backend is healthy"
                    '''
                    
                    // Check frontend health
                    sh '''
                        curl -f http://localhost:3000 || exit 1
                        echo "Frontend is healthy"
                    '''
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                script {
                    // Clean up old images
                    sh '''
                        docker image prune -f || true
                        docker system prune -f || true
                    '''
                }
            }
        }
    }
    
    post {
        always {
            // Clean up workspace
            cleanWs()
        }
        success {
            echo 'Deployment successful!'
            // Optional: Send success notification
        }
        failure {
            echo 'Deployment failed!'
            // Optional: Send failure notification
        }
    }
} 