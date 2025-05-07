import { Container } from 'typedi';
import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { ConfigService } from '@shared/services/config/config.service';

/**
 * CognitoModule handles the registration of Cognito-related services
 * with the dependency injection container.
 */
export class CognitoModule {
  /**
   * Registers Cognito services with the TypeDI container.
   */
  public static register(): void {
    Container.set({
      id: CognitoIdentityProviderClient,
      factory: () => {
        const configService = Container.get(ConfigService);
        const cognitoRegion = configService.get('COGNITO_REGION');

        if (!cognitoRegion) {
          // This error will stop the application if COGNITO_REGION is not set.
          // ConfigService itself might also perform this validation on load.
          throw new Error(
            'COGNITO_REGION is not configured. Please set it in your environment variables.',
          );
        }
        return new CognitoIdentityProviderClient({ region: cognitoRegion });
      },
    });

    // If CognitoService or other related services were not auto-registered
    // via @Injectable (though CognitoService is), you could register them here too:
    // e.g., Container.set(CognitoService, Container.get(CognitoService));
  }
}
