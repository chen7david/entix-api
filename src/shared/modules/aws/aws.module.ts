import { Container } from 'typedi';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { ConfigService } from '@shared/services/config/config.service';

/**
 * Creates a CognitoIdentityProviderClient instance using configuration from ConfigService.
 */
function createCognitoClient(configService: ConfigService): CognitoIdentityProviderClient {
  const region = configService.get('COGNITO_REGION') || 'us-east-1';

  return new CognitoIdentityProviderClient({
    region,
    credentials: {
      accessKeyId: configService.get('COGNITO_ADMIN_ACCESS_KEY'),
      secretAccessKey: configService.get('COGNITO_ADMIN_SECRET_KEY'),
    },
  });
}

/**
 * AWS Module - responsible for registering all AWS-related services with TypeDI container.
 */
export class AwsModule {
  /**
   * Registers all AWS services with the TypeDI container.
   * This includes CognitoIdentityProviderClient and potential future AWS clients.
   */
  static register(): void {
    try {
      // Get ConfigService first since we need it for client configuration
      const configService = Container.get(ConfigService);

      // Create and register CognitoIdentityProviderClient
      const cognitoClient = createCognitoClient(configService);
      Container.set(CognitoIdentityProviderClient, cognitoClient);

      // Future AWS clients would be registered here
    } catch (error) {
      console.error('Failed to register AWS services:', error);
      throw error; // Re-throw to prevent application from starting with missing dependencies
    }
  }
}
