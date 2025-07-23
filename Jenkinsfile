pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                deleteDir()
            }
        }

        stage('Clone Frontend Repo') {
            steps {
                git branch: 'main', url: 'https://github.com/nazeerbasha949/Internal-FE.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Build Vite App') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy to NGINX') {
            steps {
                sh '''
                    sudo -S rm -rf /var/www/html/frontend/*
                    sudo -S cp -r dist/* /var/www/html/frontend/
                '''
            }
        }

        stage('Restart NGINX') {
            steps {
                sh 'sudo -S systemctl restart nginx'
            }
        }
    }

    post {
        failure {
            echo '❌ Deployment failed!'
        }
        success {
            echo '✅ Frontend deployed successfully!'
        }
    }
}
