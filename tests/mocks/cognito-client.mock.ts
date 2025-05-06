import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';

/**
 * Returns a mock CognitoIdentityProviderClient with a mock send method.
 * @returns {CognitoIdentityProviderClient} A mock Cognito client
 */
export function createMockCognitoClient(mockSend: jest.Mock): CognitoIdentityProviderClient {
  return {
    send: mockSend,
  } as unknown as CognitoIdentityProviderClient;
}
