node {
    stage('Checkout') {
        checkout scm
    }

    stage('Build and Test') {
        parallel(
            'Backend Tests': {
                dir('backend') {
                    sh 'npm ci'
                    sh 'echo "No linter configured yet"'
                    sh 'npx jest --runInBand --forceExit'
                }
            },
            'Frontend Build': {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                    archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
                }
            }
        )
    }

    stage('Build Docker Images') {
        dir('backend') {
            sh 'docker build -t devtrack-pro/backend:latest .'
        }
        dir('frontend') {
            sh 'docker build -t devtrack-pro/frontend:latest .'
        }
    }
}

