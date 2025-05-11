import { Injectable } from '@shared/utils/ioc.util';
import { LoggerService } from '@shared/services/logger/logger.service';
import { Logger } from '@shared/types/logger.type';
import { JwtService, JwtPayload } from '@shared/services/jwt/jwt.service';
import { Request } from 'express';
import { Action } from 'routing-controllers';
import { UserService } from '@domains/user/user.service';
import { RoleService } from '@domains/role/role.service';
import { PermissionDto } from '@domains/permission/permission.dto';

/**
 * User object with roles and permissions
 */
export type AuthUser = {
  id: string;
  sub: string;
  username: string;
  email?: string;
  roles: string[];
  permissions: string[];
};

// Extend the Express Request interface to include our user property
declare module 'express' {
  interface Request {
    currentAuthUser?: AuthUser;
  }
}

/**
 * Service for authenticating and authorizing users
 */
@Injectable()
export class AuthVerificationService {
  private readonly logger: Logger;

  // eslint-disable-next-line max-params
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly roleService: RoleService,
    private readonly loggerService: LoggerService,
  ) {
    this.logger = this.loggerService.component('AuthVerificationService');
  }

  /**
   * Extracts and verifies JWT token from request
   * @param req - Express request
   * @returns Decoded JWT payload
   */
  async getTokenFromRequest(req: Request): Promise<JwtPayload | null> {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return null;
    }
    const token = this.jwtService.extractToken(authHeader);
    if (!token) {
      return null;
    }

    try {
      return await this.jwtService.verifyToken(token);
    } catch (error) {
      this.logger.warn('Failed to verify token', { error });
      return null;
    }
  }

  /**
   * Gets the current user from JWT token in the request
   * @param action - Routing controller action
   * @returns User object with roles and permissions
   */
  async getCurrentUser(action: Action): Promise<AuthUser | null> {
    try {
      const req = action.request;

      // Return cached user if available
      if (req.currentAuthUser) {
        return req.currentAuthUser;
      }

      const payload = await this.getTokenFromRequest(req);

      if (!payload) {
        return null;
      }

      // In Cognito, 'sub' is the unique identifier for the user
      const userBySub = await this.userService.findByCognitoSub(payload.sub);

      if (!userBySub) {
        // User exists in Cognito but not in the local database
        this.logger.warn('User found in token but not in database', { sub: payload.sub });
        return null;
      }

      // Get user roles and permissions
      const roles = await this.userService.getRolesForUser(userBySub.id);
      const roleNames = roles.map((role) => role.name);

      // Get all permissions from all roles
      const permissions: PermissionDto[] = [];
      for (const role of roles) {
        const rolePermissions = await this.roleService.getPermissionsForRole(role.id);
        permissions.push(...rolePermissions);
      }

      // Get unique permission names
      const permissionNames = [...new Set(permissions.map((permission) => permission.name))];

      // Create the user object
      const authUser: AuthUser = {
        id: userBySub.id,
        sub: payload.sub,
        username: payload.username,
        email: payload.email,
        roles: roleNames,
        permissions: permissionNames,
      };

      // Cache the user on the request object
      req.currentAuthUser = authUser;

      return authUser;
    } catch (error) {
      this.logger.error('Error getting current user', { error });
      return null;
    }
  }

  /**
   * Checks if user is authorized based on roles
   * @param action - Routing controller action
   * @param roles - Required roles for the action
   * @returns True if authorized, false otherwise
   */
  async checkAuthorization(action: Action, roles: string[]): Promise<boolean> {
    try {
      const user = await this.getCurrentUser(action);
      if (!user) {
        return false;
      }

      // If no specific roles are required, just having a valid token is enough
      if (!roles.length) {
        return true;
      }

      // Check if user has any of the required roles
      const hasRequiredRole = roles.some((role) => user.roles.includes(role));
      if (!hasRequiredRole) {
        this.logger.warn('User does not have required roles', {
          username: user.username,
          userRoles: user.roles,
          requiredRoles: roles,
        });
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error('Error checking authorization', { error });
      return false;
    }
  }

  /**
   * Checks if user has specific permission
   * @param user - Authenticated user
   * @param permission - Required permission
   * @returns True if user has permission, false otherwise
   */
  hasPermission(user: AuthUser, permission: string): boolean {
    return user.permissions.includes(permission);
  }

  /**
   * Checks if user has all of the required permissions
   * @param user - Authenticated user
   * @param permissions - Array of required permissions
   * @returns True if user has all required permissions, false otherwise
   */
  hasAllPermissions(user: AuthUser, permissions: string[]): boolean {
    return permissions.every((permission) => this.hasPermission(user, permission));
  }

  /**
   * Checks if user has any of the required permissions
   * @param user - Authenticated user
   * @param permissions - Array of required permissions
   * @returns True if user has any of the required permissions, false otherwise
   */
  hasAnyPermission(user: AuthUser, permissions: string[]): boolean {
    return permissions.some((permission) => this.hasPermission(user, permission));
  }
}
