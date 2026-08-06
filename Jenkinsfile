pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Source code checked out from GitHub'
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('backend') {
                    bat 'npm run build'
                }
            }
        }
    }

    post {
        success {
            echo 'Backend CI pipeline completed successfully!'
        }

        failure {
            echo 'Backend CI pipeline failed!'
        }
    }
}