pipeline {
    agent any
    
    environment {
        DOCKER_IMAGE_BACKEND = 'badminton-backend'
        DOCKER_IMAGE_FRONTEND = 'badminton-frontend'
        DOCKER_TAG = "${env.BUILD_NUMBER}"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
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
                        }
                    }
                }
                stage('Build Frontend Image') {
                    steps {
                        script {
                            docker.build("${DOCKER_IMAGE_FRONTEND}:${DOCKER_TAG}", "./frontend")
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
                    
                    // Pull latest images
                    sh 'docker-compose pull || true'
                    
                    // Start services
                    sh 'docker-compose up -d'
                    
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
    }
    
    post {
        always {
            // Clean up workspace
            cleanWs()
        }
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
            // Optional: Send notification
        }
    }
} 