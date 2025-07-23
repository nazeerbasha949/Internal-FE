pipeline {
    agent any

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
                sh 'npm install'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy Frontend') {
            steps {
                sh '''
                    sudo rm -rf /var/www/html/*
                    sudo cp -r dist/* /var/www/html/
                '''
            }
        }
    }
}
