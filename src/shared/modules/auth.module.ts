import { Container } from 'typedi';
import { JwtService } from '@shared/services/jwt/jwt.service';
import { AuthVerificationService } from '@shared/services/auth/auth-verification.service';
import { ConfigService } from '@shared/services/config/config.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { UserService } from '@domains/user/user.service';
import { RoleService } from '@domains/role/role.service';

/**
 * Module for authentication and authorization services
 */
export class AuthModule {
  /**
   * Registers all auth-related services in the DI container
   */
  static register(): void {
    // Register services
    try {
      const configService = Container.get(ConfigService);
      const loggerService = Container.get(LoggerService);

      // Create and register JwtService
      const jwtService = new JwtService(configService, loggerService);
      Container.set(JwtService, jwtService);

      // Create and register AuthVerificationService
      try {
        const userService = Container.get(UserService);
        const roleService = Container.get(RoleService);

        const authVerificationService = new AuthVerificationService(
          jwtService,
          userService,
          roleService,
          loggerService,
        );
        Container.set(AuthVerificationService, authVerificationService);
      } catch (error) {
        const logger = loggerService.component('AuthModule');
        logger.warn('Could not register AuthVerificationService - might be initialized later', {
          error,
        });
      }
    } catch (error) {
      console.warn('Error registering auth module:', error);
    }
  }
}
