pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'ghcr.io'
        DOCKER_IMAGE = 'chen7david/entix-api'
        NODE_ENV = 'production'
        PORT = '3000'
        APP_NAME = 'entix-api'
        LOG_LEVEL = 'info'
    }

    stages {
        stage('Pull Latest Image') {
            steps {
                sh '''
                docker pull $DOCKER_REGISTRY/$DOCKER_IMAGE:latest
                '''
            }
        }

        stage('Stop and Remove Old Container') {
            steps {
                sh '''
                docker ps -q --filter "name=entix-api" | grep -q . && docker stop entix-api || true
                docker ps -aq --filter "name=entix-api" | grep -q . && docker rm entix-api || true
                '''
            }
        }

        stage('Deploy New Container') {
            steps {
                sh '''
                docker run -d \
                    --name entix-api \
                    -p $PORT:$PORT \
                    -e NODE_ENV=$NODE_ENV \
                    -e PORT=$PORT \
                    -e APP_NAME=$APP_NAME \
                    -e LOG_LEVEL=$LOG_LEVEL \
                    --restart unless-stopped \
                    $DOCKER_REGISTRY/$DOCKER_IMAGE:latest
                '''
            }
        }

        stage('Cleanup') {
            steps {
                sh '''
                docker system prune -f
                '''
            }
        }
    }

    post {
        always {
            sh 'docker logout $DOCKER_REGISTRY'
        }
    }
}
