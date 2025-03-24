pipeline {
    agent any

    environment {
        NEW_RELIC_LICENSE_KEY = credentials('NEW_RELIC_LICENSE_KEY')
        
        DOCKER_REGISTRY = 'ghcr.io'
        DOCKER_IMAGE = 'chen7david/entix-api'
        NODE_ENV = 'production'

        // Logger Configuration
        APP_NAME = 'EntixAPI'
        LOG_LEVEL = 'info'

        // Database Configuration
        DB_HOST = 'postgres'
        DB_PORT = '5432'
        DB_USER = 'postgres'
        DB_PASSWORD = 'postgres'
        CONNECTION_TIMEOUT_MILLIS = '5000'
        IDLE_TIMEOUT_MILLIS = '30000'
        MAX_POOL_SIZE = '20'

        // Cognito Configuration
        COGNITO_USER_POOL_ID = 'us-east-1_123456789'
        COGNITO_CLIENT_ID = '1234567890abcdef'
        COGNITO_REGION = 'us-east-1'
    }

    stages {
        stage('Set Environment Variables') {
            steps {
                script {
                    // Set environment variables based on the job name
                    def isProd = env.JOB_NAME.contains('prod')
                    def PROD_PORT = '3000'
                    def STAGING_PORT = '4000'
                    def PROD_ID = 'prod-entix-api'
                    def STAGING_ID = 'staging-entix-api'

                    env.PORT = isProd ? PROD_PORT : STAGING_PORT
                    env.DB_NAME = isProd ? PROD_ID : STAGING_ID
                    env.CONTAINER_NAME = isProd ? PROD_ID : STAGING_ID
                    env.NEW_RELIC_ENABLED = isProd ? 'true' : 'false'
                    env.NEW_RELIC_APP_NAME = isProd ? PROD_ID : STAGING_ID
                    if (!isProd) {
                        env.NEW_RELIC_LICENSE_KEY = ''
                        env.DOCKER_IMAGE += '-staging'
                    }
                    echo "isProd: ${isProd}"
                }
            }
        }

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
                    --network db_network \
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