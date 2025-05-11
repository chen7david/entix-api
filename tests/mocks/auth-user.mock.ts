import { AuthUser } from '@shared/services/auth/auth-verification.service';

/**
 * Options for creating a mock AuthUser
 */
export type MockAuthUserOptions = Partial<AuthUser>;

/**
 * Creates a mock AuthUser object with default values that can be overridden
 * @param options - Partial AuthUser properties to override defaults
 * @returns A mock AuthUser object
 */
export function createMockAuthUser(options: MockAuthUserOptions = {}): AuthUser {
  return {
    id: options.id ?? 'mock-user-id',
    sub: options.sub ?? 'mock-cognito-sub',
    username: options.username ?? 'mock-username',
    email: options.email ?? 'mock-user@example.com',
    roles: options.roles ?? ['user'],
    permissions: options.permissions ?? ['read:own-profile'],
  };
}

/**
 * Creates a mock admin user with full permissions
 * @returns A mock AuthUser object with admin role and permissions
 */
export function createMockAdminUser(): AuthUser {
  return createMockAuthUser({
    roles: ['admin', 'user'],
    permissions: [
      'read:users',
      'write:users',
      'delete:users',
      'read:roles',
      'write:roles',
      'delete:roles',
      'read:permissions',
      'write:permissions',
      'delete:permissions',
    ],
  });
}
