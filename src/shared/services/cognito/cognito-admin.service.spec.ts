import { ConfigService } from '@shared/services/config/config.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminCreateUserCommand,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoAdminService } from '@shared/services/cognito/cognito-admin.service';

describe('CognitoAdminService', () => {
  let cognitoAdminService: CognitoAdminService;
  let mockConfigService: ConfigService;
  let mockLoggerService: LoggerService;
  let mockCognitoClient: { send: jest.Mock };

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          COGNITO_REGION: 'us-west-2',
          COGNITO_USER_POOL_ID: 'us-west-2_abcdefghi',
          COGNITO_CLIENT_ID: 'client-id',
          COGNITO_ADMIN_ACCESS_KEY: 'AKIAIOSFODNN7EXAMPLE',
          COGNITO_ADMIN_SECRET_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
        };
        return config[key];
      }),
    } as unknown as ConfigService;

    mockLoggerService = {
      component: jest.fn().mockReturnThis(),
      info: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
    } as unknown as LoggerService;

    mockCognitoClient = {
      send: jest.fn(),
    };

    // Create a new instance of CognitoAdminService with mocked dependencies
    cognitoAdminService = new CognitoAdminService(
      mockConfigService,
      mockLoggerService,
      mockCognitoClient as unknown as CognitoIdentityProviderClient,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listUsers', () => {
    it('should list users in cognito user pool', async () => {
      const mockResponse = {
        Users: [
          {
            Username: 'user1',
            Attributes: [
              { Name: 'email', Value: 'user1@example.com' },
              { Name: 'sub', Value: '123456' },
            ],
            Enabled: true,
            UserStatus: 'CONFIRMED',
            UserCreateDate: new Date(),
            UserLastModifiedDate: new Date(),
          },
        ],
        PaginationToken: 'next-token',
      };

      mockCognitoClient.send.mockResolvedValueOnce(mockResponse);

      const result = await cognitoAdminService.listUsers({ limit: 10 });

      expect(mockCognitoClient.send).toHaveBeenCalledWith(expect.any(ListUsersCommand));
      expect(result.users).toHaveLength(1);
      expect(result.users[0].username).toBe('user1');
      expect(result.users[0].attributes.email).toBe('user1@example.com');
      expect(result.paginationToken).toBe('next-token');
    });

    it('should handle errors when listing users', async () => {
      const mockError = new Error('Cognito error');
      mockCognitoClient.send.mockRejectedValueOnce(mockError);

      await expect(cognitoAdminService.listUsers()).rejects.toThrow();
    });
  });

  describe('adminCreateUser', () => {
    it('should create a user in cognito user pool', async () => {
      const mockResponse = {
        User: {
          Username: 'newuser',
          Attributes: [
            { Name: 'email', Value: 'newuser@example.com' },
            { Name: 'sub', Value: '654321' },
          ],
          Enabled: true,
          UserStatus: 'FORCE_CHANGE_PASSWORD',
          UserCreateDate: new Date(),
          UserLastModifiedDate: new Date(),
        },
      };

      mockCognitoClient.send.mockResolvedValueOnce(mockResponse);

      const result = await cognitoAdminService.adminCreateUser({
        username: 'newuser',
        email: 'newuser@example.com',
        temporaryPassword: 'TempPass123!',
      });

      expect(mockCognitoClient.send).toHaveBeenCalledWith(expect.any(AdminCreateUserCommand));
      expect(result.user.username).toBe('newuser');
      expect(result.user.attributes.email).toBe('newuser@example.com');
      expect(result.user.userStatus).toBe('FORCE_CHANGE_PASSWORD');
    });

    it('should throw an error if user creation fails', async () => {
      mockCognitoClient.send.mockResolvedValueOnce({});

      await expect(
        cognitoAdminService.adminCreateUser({
          username: 'newuser',
          email: 'newuser@example.com',
        }),
      ).rejects.toThrow('User creation failed');
    });
  });

  describe('adminGetUser', () => {
    it('should get a user by username', async () => {
      const mockResponse = {
        Username: 'existinguser',
        UserAttributes: [
          { Name: 'email', Value: 'existinguser@example.com' },
          { Name: 'sub', Value: '987654' },
        ],
        Enabled: true,
        UserStatus: 'CONFIRMED',
        UserCreateDate: new Date(),
        UserLastModifiedDate: new Date(),
      };

      mockCognitoClient.send.mockResolvedValueOnce(mockResponse);

      const result = await cognitoAdminService.adminGetUser({
        username: 'existinguser',
      });

      expect(mockCognitoClient.send).toHaveBeenCalledWith(expect.any(AdminGetUserCommand));
      expect(result.username).toBe('existinguser');
      expect(result.attributes.email).toBe('existinguser@example.com');
      expect(result.userStatus).toBe('CONFIRMED');
    });

    it('should handle errors when getting a user', async () => {
      const mockError = new Error('User not found');
      mockCognitoClient.send.mockRejectedValueOnce(mockError);

      await expect(
        cognitoAdminService.adminGetUser({ username: 'nonexistentuser' }),
      ).rejects.toThrow();
    });
  });
});
