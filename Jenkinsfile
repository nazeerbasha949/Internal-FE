pipeline {
    agent any
    environment {
        NODE_ENV = 'production'
    }

    stages {
        stage('Clone Code') {
            steps {
                git credentialsId: 'nazeerbasha949', url: 'https://github.com/nazeerbasha949/Internal-FE.git', branch: 'main'
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

        stage('Deploy') {
            steps {
                sh '''
                sudo rm -rf /var/www/html/*
                sudo cp -r dist/* /var/www/html/
                '''
            }
        }
    }
}
