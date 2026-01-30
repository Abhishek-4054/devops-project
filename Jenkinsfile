pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'abhishekc4054'  // ← Change this
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/frontend"
        VM_USER = 'akshu001'
        VM_IP = '192.168.0.9'  // Updated IP
        SSH_OPTS = '-o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL'
    }
    
    stages {
        stage('📥 Checkout Code') {
            steps {
                echo '🔄 Pulling code from GitHub...'
                checkout scm
            }
        }
        
        stage('🏗️ Build Backend') {
            steps {
                echo '🐳 Building Backend Docker Image...'
                dir('backend') {
                    bat """
                        docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} .
                        docker tag ${BACKEND_IMAGE}:${BUILD_NUMBER} ${BACKEND_IMAGE}:latest
                    """
                }
            }
        }
        
        stage('🏗️ Build Frontend') {
            steps {
                echo '🐳 Building Frontend Docker Image...'
                dir('frontend') {
                    bat """
                        docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} .
                        docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER} ${FRONTEND_IMAGE}:latest
                    """
                }
            }
        }
        
        stage('📤 Push to DockerHub') {
            steps {
                echo '⬆️ Pushing to DockerHub...'
                bat """
                    echo %DOCKERHUB_CREDENTIALS_PSW% | docker login -u %DOCKERHUB_CREDENTIALS_USR% --password-stdin
                    docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}
                    docker push ${BACKEND_IMAGE}:latest
                    docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}
                    docker push ${FRONTEND_IMAGE}:latest
                    docker logout
                """
            }
        }
        
        stage('📋 Copy K8s Files') {
            steps {
                echo '📂 Copying K8s manifests to VM...'
                bat """
                    scp ${SSH_OPTS} -r k8s ${VM_USER}@${VM_IP}:/home/${VM_USER}/
                """
            }
        }
        
        stage('🚀 Deploy to K8s') {
            steps {
                echo '☸️ Deploying to Kubernetes...'
                bat """
                    ssh ${SSH_OPTS} ${VM_USER}@${VM_IP} "kubectl apply -f /home/${VM_USER}/k8s/backend-deployment.yaml"
                    ssh ${SSH_OPTS} ${VM_USER}@${VM_IP} "kubectl apply -f /home/${VM_USER}/k8s/frontend-deployment.yaml"
                    ssh ${SSH_OPTS} ${VM_USER}@${VM_IP} "kubectl rollout restart deployment/backend"
                    ssh ${SSH_OPTS} ${VM_USER}@${VM_IP} "kubectl rollout restart deployment/frontend"
                """
            }
        }
        
        stage('✅ Verify') {
            steps {
                echo '🔍 Verifying deployment...'
                bat """
                    ssh ${SSH_OPTS} ${VM_USER}@${VM_IP} "kubectl get pods"
                    ssh ${SSH_OPTS} ${VM_USER}@${VM_IP} "kubectl get svc"
                """
            }
        }
    }
    
    post {
        always {
            bat 'docker logout || exit 0'
        }
        success {
            echo '🎉 ✅ DEPLOYMENT SUCCESSFUL!'
            echo '🌐 Access: http://MINIKUBE_IP:30080'
        }
        failure {
            echo '❌ DEPLOYMENT FAILED! Check logs above.'
        }
    }
}