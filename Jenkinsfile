pipeline {
    agent any

    environment {
        // DockerHub
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKERHUB_USERNAME = 'abhishekc4054'

        // Images
        BACKEND_IMAGE  = "${DOCKERHUB_USERNAME}/backend"
        FRONTEND_IMAGE = "${DOCKERHUB_USERNAME}/frontend"

        // VM
        VM_USER = 'akshu001'
        VM_IP   = '192.168.0.9'
        SSH_KEY = 'C:\\jenkins-ssh\\vm_key'
        SSH_OPTS = "-i ${SSH_KEY} -o StrictHostKeyChecking=no"
    }

    options {
        timestamps()
        timeout(time: 15, unit: 'MINUTES')
    }

    stages {

        stage('📥 Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('🏗️ Build Backend Image') {
            steps {
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
                bat """
                    scp ${SSH_OPTS} -r k8s ${VM_USER}@${VM_IP}:/home/${VM_USER}/
                """
            }
        }

        stage('🚀 Deploy Backend to Kubernetes') {
            steps {
                bat """
                    ssh ${SSH_OPTS} ${VM_USER}@${VM_IP} "kubectl apply -f /home/${VM_USER}/k8s/backend-deployment.yaml"
                    ssh ${SSH_OPTS} ${VM_USER}@${VM_IP} "kubectl rollout restart deployment/backend"
                """
            }
        }

        stage('🚀 Deploy Frontend to Kubernetes') {
            steps {
                bat """
                    ssh ${SSH_OPTS} ${VM_USER}@${VM_IP} "kubectl apply -f /home/${VM_USER}/k8s/frontend-deployment.yaml"
                    ssh ${SSH_OPTS} ${VM_USER}@${VM_IP} "kubectl rollout restart deployment/frontend"
                """
            }
        }

        stage('✅ Verify Deployment') {
            steps {
                bat """
                    ssh ${SSH_OPTS} ${VM_USER}@${VM_IP} "kubectl get pods -o wide"
                    ssh ${SSH_OPTS} ${VM_USER}@${VM_IP} "kubectl get svc"
                """
            }
        }
    }

    post {
        success {
            echo '🎉 PIPELINE SUCCESS'
        }
        failure {
            echo '❌ PIPELINE FAILED – CHECK ABOVE LOGS'
        }
        always {
            bat 'docker logout || exit 0'
        }
    }
}
