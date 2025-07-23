pipeline {
    agent any

    options {
        timeout(time: 10, unit: 'MINUTES') // Kill after 10 mins if stuck
    }

    environment {
        NODE_ENV = 'production'
    }

    stages {
        stage('Clone Repo') {
            steps {
                git branch: 'main', url: 'https://github.com/nazeerbasha949/Internal-FE.git'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install --include=dev'
            }
        }

        stage('Build Vite App') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy to NGINX') {
            steps {
                // This must work without password
                sh 'sudo rm -rf /var/www/html/*'
                sh 'sudo cp -r dist/* /var/www/html/'
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
            echo '❌ Something went wrong...'
        }
    }
}
