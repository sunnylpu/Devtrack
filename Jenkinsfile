pipeline {
    agent any

    environment {
        AWS_ACCOUNT_ID = '213462345512'
        AWS_REGION     = 'us-east-1'
        ECR_REGISTRY   = '213462345512.dkr.ecr.us-east-1.amazonaws.com'
        EKS_CLUSTER    = 'devtrack-eks-cluster'
        NAMESPACE      = 'devtrack'
    }

    stages {
        stage('Build and Test') {
            parallel {
                stage('Backend Tests') {
                    steps {
                        dir('backend') {
                            sh 'npm ci'
                            sh 'echo "No linter configured yet"'
                            sh 'npx jest --runInBand --forceExit'
                        }
                    }
                }

                stage('Frontend Build') {
                    steps {
                        dir('frontend') {
                            sh 'npm ci'
                            sh 'npm run build'
                        }
                    }
                    post {
                        success {
                            archiveArtifacts artifacts: 'frontend/dist/**/*', allowEmptyArchive: true
                        }
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                dir('backend') {
                    sh 'docker build -t $ECR_REGISTRY/devtrack-backend:latest .'
                }
                dir('frontend') {
                    sh 'docker build -t $ECR_REGISTRY/devtrack-frontend:latest .'
                }
            }
        }

        stage('Push Images to AWS ECR') {
            steps {
                sh '''
                    export HTTP_PROXY="" HTTPS_PROXY="" http_proxy="" https_proxy=""
                    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
                    docker push $ECR_REGISTRY/devtrack-backend:latest
                    docker push $ECR_REGISTRY/devtrack-frontend:latest
                '''
            }
        }

        stage('Deploy to AWS EKS') {
            steps {
                sh '''
                    aws eks update-kubeconfig --name $EKS_CLUSTER --region $AWS_REGION
                    kubectl apply -k k8s/ --insecure-skip-tls-verify=true
                    kubectl rollout restart deployment backend frontend -n $NAMESPACE --insecure-skip-tls-verify=true
                '''
            }
        }
    }
}

