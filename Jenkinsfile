pipeline {
    agent any

    environment {
        APP_DIR = '/home/ubuntu/Internal-FE'
        DEPLOY_DIR = '/var/www/html/frontend'
        REPO_URL = 'https://github.com/nazeerbasha949/Internal-FE.git'
    }

    stages {
        stage('Clean Workspace') {
            steps {
                deleteDir()
            }
        }

        stage('Clone Frontend Repo') {
            steps {
                git branch: 'main', url: "${env.REPO_URL}"
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
                    sudo rm -rf ${DEPLOY_DIR}/*
                    sudo cp -r dist/* ${DEPLOY_DIR}/
                '''
            }
        }

        stage('Restart NGINX') {
            steps {
                sh 'sudo systemctl restart nginx'
            }
        }
    }

    post {
        success {
            echo '✅ Frontend deployed successfully!'
        }
        failure {
            echo '❌ Deployment failed!'
        }
    }
}
