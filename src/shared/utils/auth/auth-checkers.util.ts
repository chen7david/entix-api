import { Action } from 'routing-controllers';
import { Container } from 'typedi';
import { AuthVerificationService, AuthUser } from '@shared/services/auth/auth-verification.service';
import { LoggerService } from '@shared/services/logger/logger.service';

/**
 * Authorization checker function for routing-controllers
 * Verifies if the user has the required permissions
 *
 * @param action - The routing-controllers action
 * @param requirements - The permissions required for the route
 * @returns Promise resolving to boolean indicating if the user is authorized
 */
export const authorizationChecker = async (
  action: Action,
  requirements: string[],
): Promise<boolean> => {
  const logger = Container.get(LoggerService).component('AuthorizationChecker');
  try {
    const authService = Container.get(AuthVerificationService);

    // Get current user
    const user = await authService.getCurrentUser(action);
    if (!user) {
      logger.debug('No authenticated user found');
      return false;
    }

    // If no specific requirements, just having a valid token is enough
    if (!requirements.length) {
      return true;
    }

    // Check if user has any of the required permissions
    const hasRequiredPermission = requirements.some((permission) =>
      user.permissions.includes(permission),
    );

    if (!hasRequiredPermission) {
      logger.warn('Authorization check failed', {
        username: user.username,
        userPermissions: user.permissions,
        requiredPermissions: requirements,
      });
    }

    return hasRequiredPermission;
  } catch (error) {
    logger.error('Error in authorization checker', { error });
    return false;
  }
};

/**
 * Current user checker function for routing-controllers
 * Extracts the current user from the request based on JWT token
 *
 * @param action - The routing-controllers action
 * @returns Promise resolving to the current user or undefined
 */
export const currentUserChecker = async (action: Action): Promise<AuthUser | undefined> => {
  const logger = Container.get(LoggerService).component('CurrentUserChecker');
  try {
    const authService = Container.get(AuthVerificationService);
    const user = await authService.getCurrentUser(action);
    return user || undefined;
  } catch (error) {
    logger.error('Error in current user checker', { error });
    return undefined;
  }
};
