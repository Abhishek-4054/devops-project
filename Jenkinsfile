pipeline {
    agent any
    
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'abhishekc4054' 
        BACKEND_IMAGE = "${DOCKERHUB_USERNAME}/backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/frontend"
        VM_USER = 'akshu001'
        VM_IP = '192.168.0.9'
    }
    
    stages {
        stage('📥 Checkout Code') {
            steps {
                echo '🔄 Pulling code from GitHub...'
                checkout scm
            }
        }
        
        stage('🏗️ Build Docker Images') {
            steps {
                echo '🐳 Building images...'
                script {
                    bat """
                        cd backend
                        docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} .
                        docker tag ${BACKEND_IMAGE}:${BUILD_NUMBER} ${BACKEND_IMAGE}:latest
                        cd ..
                        
                        cd frontend
                        docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} .
                        docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER} ${FRONTEND_IMAGE}:latest
                        cd ..
                    """
                }
            }
        }
        
        stage('📤 Push to DockerHub') {
            steps {
                echo '⬆️ Pushing to DockerHub...'
                script {
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
        }
        
        stage('📋 Copy K8s Files to VM') {
            steps {
                echo '📂 Copying K8s manifests...'
                script {
                    bat """
                        scp -o StrictHostKeyChecking=no -r k8s ${VM_USER}@${VM_IP}:/home/${VM_USER}/
                    """
                }
            }
        }
        
        stage('🚀 Deploy to Kubernetes') {
            steps {
                echo '☸️ Deploying to K8s on VM...'
                script {
                    bat """
                        ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} "kubectl apply -f /home/${VM_USER}/k8s/backend-deployment.yaml"
                        ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} "kubectl apply -f /home/${VM_USER}/k8s/frontend-deployment.yaml"
                        ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} "kubectl rollout restart deployment/backend"
                        ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} "kubectl rollout restart deployment/frontend"
                    """
                }
            }
        }
        
        stage('✅ Verify Deployment') {
            steps {
                echo '🔍 Checking deployment status...'
                script {
                    bat """
                        ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} "kubectl get pods"
                        ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} "kubectl get svc"
                    """
                }
            }
        }
    }
    
    post {
        always {
            bat 'docker logout'
        }
        success {
            echo '🎉 ✅ Pipeline SUCCESS!'
            echo '🌐 Access app: http://MINIKUBE_IP:30080'
        }
        failure {
            echo '❌ Pipeline FAILED!'
        }
    }
}
