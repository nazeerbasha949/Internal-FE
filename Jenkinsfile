pipeline {
  agent any

  stages {
    stage('Clone Code') {
      steps {
        git 'https://github.com/nazeerbasha949/Internal-FE.git'
      }
    }

    stage('Install Dependencies') {
      steps {
        sh 'npm install'
      }
    }

    stage('Build Project') {
      steps {
        sh 'npm run build'
      }
    }

    stage('Deploy to Apache Web Server') {
      steps {
        echo "Deploying to /var/www/html"
        sh '''
          sudo rm -rf /var/www/html/*
          sudo cp -r dist/* /var/www/html/
        '''
      }
    }
  }
}
