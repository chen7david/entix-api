pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'ghcr.io'
        DOCKER_IMAGE = 'chen7david/entix-api'
        NODE_ENV = 'production'
        PORT = '3000'  // From .env.example
        APP_NAME = 'EntixAPI'  // From .env.example
        LOG_LEVEL = 'info'  // From .env.example

        // Database Configuration
        DB_HOST = credentials('DB_HOST')  // Add this in Jenkins credentials
        DB_PORT = credentials('DB_PORT')  // Add this in Jenkins credentials
        DB_NAME = credentials('DB_NAME')  // Add this in Jenkins credentials
        DB_USER = credentials('DB_USER')  // Add this in Jenkins credentials
        DB_PASSWORD = credentials('DB_PASSWORD')  // Add this in Jenkins credentials

        // New Relic Configuration
        NEW_RELIC_ENABLED = 'true'  // Set to true to enable New Relic
        NEW_RELIC_LICENSE_KEY = credentials('NEW_RELIC_LICENSE_KEY')  // Add this in Jenkins credentials
        NEW_RELIC_APP_NAME = 'entix-api-test'  // From .env.example

        // Timeout and Pool Size
        CONNECTION_TIMEOUT_MILLIS = '5000'  // From .env.example
        IDLE_TIMEOUT_MILLIS = '30000'  // From .env.example
        MAX_POOL_SIZE = '20'  // From .env.example
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
                    -e NEW_RELIC_ENABLED=$NEW_RELIC_ENABLED \
                    -e NEW_RELIC_LICENSE_KEY=$NEW_RELIC_LICENSE_KEY \
                    -e NEW_RELIC_APP_NAME=$NEW_RELIC_APP_NAME \
                    -e DB_HOST=$DB_HOST \
                    -e DB_PORT=$DB_PORT \
                    -e DB_NAME=$DB_NAME \
                    -e DB_USER=$DB_USER \
                    -e DB_PASSWORD=$DB_PASSWORD \
                    -e CONNECTION_TIMEOUT_MILLIS=$CONNECTION_TIMEOUT_MILLIS \
                    -e IDLE_TIMEOUT_MILLIS=$IDLE_TIMEOUT_MILLIS \
                    -e MAX_POOL_SIZE=$MAX_POOL_SIZE \
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
            sh 'docker logout $DOCKER_REGISTRY' // This can be removed since no login is performed
        }
    }
}