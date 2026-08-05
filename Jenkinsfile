pipeline {
    agent any

    environment {
        NODE_VERSION = '20'
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
            when {
                branch 'main'
            }
            steps {
                dir('backend') {
                    sh 'docker build -t devtrack-pro/backend:latest .'
                }
                dir('frontend') {
                    sh 'docker build -t devtrack-pro/frontend:latest .'
                }
            }
        }
    }
}
