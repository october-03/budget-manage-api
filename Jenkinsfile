pipeline {
  agent any

  stages {
    stage('github-clone') {
      steps {
        git branch: 'main', credentialsId: 'github-token', url: 'https://github.com/october-03/budget-manage-api.git'
        echo "PG_USER=$PG_USER" >> .env
        echo "PG_PASSWORD=$PG_PASSWORD" >> .env
        echo "PG_NAME=$PG_NAME" >> .env
      }
    }

    stage('build') {
      steps {
        sh 'docker-compose build'
      }
    }

    stage('deploy') {
      steps {
        sh 'docker-compose up -d'
      }
    }
  }
}