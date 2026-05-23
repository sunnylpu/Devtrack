pipeline {
    agent any

    environment {
        // You can define environment variables here that will be accessible in all stages
        // Example: DOCKER_IMAGE_PREFIX = 'my-registry.com/devtrack-pro'
        NODE_ENV = 'production'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Repository checked out successfully."
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    // Assuming Node.js is available on the Jenkins agent
                    sh 'npm install'
                    // Uncomment the next line if you have a test script in package.json
                    // sh 'npm run test'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm install'
                    sh 'npm run build'
                    // Uncomment the next line if you have a test script in package.json
                    // sh 'npm run test'
                }
            }
        }

        stage('Docker Build') {
            steps {
                // Ensure Docker and docker-compose are available on the agent
                echo "Building Docker images for all services..."
                sh 'docker-compose build'
            }
        }

        stage('Deploy (Docker Compose Up)') {
            steps {
                echo "Deploying application via Docker Compose..."
                // Take down existing containers if any
                sh 'docker-compose down'
                // Start the containers in detached mode
                sh 'docker-compose up -d'
                echo "Application deployed successfully!"
            }
        }
    }

    post {
        always {
            echo "Pipeline execution completed."
            // You can add steps to run regardless of the build outcome (e.g., cleaning up workspace)
            // cleanWs()
        }
        success {
            echo "The build and deployment were successful."
        }
        failure {
            echo "The build or deployment failed. Please check the logs."
        }
    }
}
