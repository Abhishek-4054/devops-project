pipeline {
    agent any

    environment {
        // DockerHub
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME    = 'abhishekc4054'

        // Images
        BACKEND_IMAGE  = "${DOCKERHUB_USERNAME}/backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/frontend"

        // VM Details
        VM_USER = 'akshu001'
        VM_IP   = '192.168.0.9'
    }

    options {
        timestamps()
        timeout(time: 15, unit: 'MINUTES')
    }

    stages {

        stage('📥 Checkout Code') {
            steps {
                echo 'Cloning GitHub repository...'
                checkout scm
            }
        }

        stage('🏗️ Build Backend Image') {
            steps {
                echo 'Building backend Docker image...'
                dir('backend') {
                    bat """
                        docker build -t ${BACKEND_IMAGE}:${BUILD_NUMBER} .
                        docker tag ${BACKEND_IMAGE}:${BUILD_NUMBER} ${BACKEND_IMAGE}:latest
                    """
                }
            }
        }

        stage('🏗️ Build Frontend Image') {
            steps {
                echo 'Building frontend Docker image...'
                dir('frontend') {
                    bat """
                        docker build -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} .
                        docker tag ${FRONTEND_IMAGE}:${BUILD_NUMBER} ${FRONTEND_IMAGE}:latest
                    """
                }
            }
        }

        stage('📤 Push Images to DockerHub') {
            steps {
                echo 'Pushing Docker images to DockerHub...'
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

        stage('📋 Copy K8s Manifests to VM') {
            steps {
                echo 'Copying Kubernetes manifests to VM...'
                sshagent(['vm-ssh-key']) {
                    bat """
                        scp -o StrictHostKeyChecking=no -r k8s ${VM_USER}@${VM_IP}:/home/${VM_USER}/
                    """
                }
            }
        }

        stage('🚀 Deploy Backend to Kubernetes') {
            steps {
                echo 'Deploying backend...'
                sshagent(['vm-ssh-key']) {
                    bat """
                        ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} "kubectl apply -f /home/${VM_USER}/k8s/backend-deployment.yaml"
                        ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} "kubectl rollout restart deployment/backend"
                    """
                }
            }
        }

        stage('🚀 Deploy Frontend to Kubernetes') {
            steps {
                echo 'Deploying frontend...'
                sshagent(['vm-ssh-key']) {
                    bat """
                        ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} "kubectl apply -f /home/${VM_USER}/k8s/frontend-deployment.yaml"
                        ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} "kubectl rollout restart deployment/frontend"
                    """
                }
            }
        }

        stage('✅ Verify Deployment') {
            steps {
                echo 'Verifying Kubernetes resources...'
                sshagent(['vm-ssh-key']) {
                    bat """
                        ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} "kubectl get pods -o wide"
                        ssh -o StrictHostKeyChecking=no ${VM_USER}@${VM_IP} "kubectl get svc"
                    """
                }
            }
        }
    }

    post {
        success {
            echo '🎉 CI/CD PIPELINE COMPLETED SUCCESSFULLY'
        }
        failure {
            echo '❌ PIPELINE FAILED – CHECK LOGS'
        }
        always {
            bat 'docker logout || exit 0'
        }
    }
}
