pipeline {
    agent any

    environment {
        NEW_RELIC_LICENSE_KEY = credentials('NEW_RELIC_LICENSE_KEY')
    }

    stages {
        stage('Build') {

            agent {
                docker {
                    image 'node:20-alpine'
                    reuseNode true
                }
            }
            steps {
                sh '''
                ls -la
                node --version
                npm --version
                npm install
                npm ci
                npm run build
                echo "NEW_RELIC_LICENSE_KEY: $NEW_RELIC_LICENSE_KEY"
                echo "the end!"
                '''
            }
        }
    }
}
