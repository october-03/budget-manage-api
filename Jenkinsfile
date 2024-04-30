pipeline {
  agent any

  stages {
    stage('github-clone') {
      steps {
        git branch: 'main', credentialsId: 'github-token', url: 'https://github.com/october-03/budget-manage-api.git'
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