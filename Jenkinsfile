pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = 'ghcr.io'
        DOCKER_IMAGE = 'chen7david/entix-api'
        
        // Application Settings
        NODE_ENV = 'production'
        PORT = '3000'
        
        // Logger Configuration
        APP_NAME = 'EntixAPI'
        LOG_LEVEL = 'info'

        // Database Configuration
        DB_HOST = 'postgres'
        DB_PORT = '5432'
        DB_NAME = 'postgres'
        DB_USER = 'postgres'
        DB_PASSWORD = 'postgres'
        CONNECTION_TIMEOUT_MILLIS = '5000'
        IDLE_TIMEOUT_MILLIS = '30000'
        MAX_POOL_SIZE = '20'

        // New Relic Configuration
        NEW_RELIC_ENABLED = 'true'
        NEW_RELIC_LICENSE_KEY = credentials('NEW_RELIC_LICENSE_KEY')
        NEW_RELIC_APP_NAME = 'prod-entix-api'
        
        // Cognito Configuration
        COGNITO_USER_POOL_ID = 'us-east-1_123456789'
        COGNITO_CLIENT_ID = '1234567890abcdef'
        COGNITO_REGION = 'us-east-1'
        
        // Container details
        CONTAINER_NAME = 'entix-api'
    }

    stages {
        stage('Pull Latest Image') {
            steps {
                sh '''
                docker pull $DOCKER_REGISTRY/$DOCKER_IMAGE:latest
                '''
            }
        }

        stage('Deploy Container') {
            steps {
                sh '''
                # Stop and remove existing container if it exists
                docker stop $CONTAINER_NAME || true
                docker rm $CONTAINER_NAME || true
                
                # Start new container
                docker run -d \
                    --name $CONTAINER_NAME \
                    --network web_network \
                    -p $PORT:$PORT \
                    -e NODE_ENV=$NODE_ENV \
                    -e PORT=$PORT \
                    -e APP_NAME=$APP_NAME \
                    -e LOG_LEVEL=$LOG_LEVEL \
                    -e DB_HOST=$DB_HOST \
                    -e DB_PORT=$DB_PORT \
                    -e DB_NAME=$DB_NAME \
                    -e DB_USER=$DB_USER \
                    -e DB_PASSWORD=$DB_PASSWORD \
                    -e CONNECTION_TIMEOUT_MILLIS=$CONNECTION_TIMEOUT_MILLIS \
                    -e IDLE_TIMEOUT_MILLIS=$IDLE_TIMEOUT_MILLIS \
                    -e MAX_POOL_SIZE=$MAX_POOL_SIZE \
                    -e NEW_RELIC_ENABLED=$NEW_RELIC_ENABLED \
                    -e NEW_RELIC_LICENSE_KEY=$NEW_RELIC_LICENSE_KEY \
                    -e NEW_RELIC_APP_NAME=$NEW_RELIC_APP_NAME \
                    -e COGNITO_USER_POOL_ID=$COGNITO_USER_POOL_ID \
                    -e COGNITO_CLIENT_ID=$COGNITO_CLIENT_ID \
                    -e COGNITO_REGION=$COGNITO_REGION \
                    --restart unless-stopped \
                    $DOCKER_REGISTRY/$DOCKER_IMAGE:latest
                
                # Connect the container to web_network
                docker network connect web_network $CONTAINER_NAME
                '''
            }
        }

        stage('Cleanup') {
            steps {
                sh '''
                # Clean up unused images
                docker image prune -a -f --filter "until=24h"
                
                # Clean up system
                docker system prune -f
                '''
            }
        }
    }

    post {
        success {
            echo 'Deployment completed successfully'
        }
        failure {
            echo 'Deployment failed'
        }
    }
}