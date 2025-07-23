pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'main', url: 'https://github.com/nazeerbasha949/Internal-FE.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                // Install dev dependencies too (for @vitejs/plugin-react)
                sh 'npm install --include=dev'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy to NGINX') {
            steps {
                script {
                    // Clear existing deployment
                    sh 'sudo rm -rf /var/www/html/*'
                    
                    // Copy Vite build output
                    sh 'sudo cp -r dist/* /var/www/html/'
                }
            }
        }
    }

    post {
        success {
            echo '🎉 Frontend deployment completed successfully!'
        }
        failure {
            echo '❌ Frontend deployment failed. Please check errors above!'
        }
    }
}
