/**
 * Parameters for signUp method.
 */
export type SignUpParams = {
  username: string;
  email: string;
  password: string;
  attributes?: Record<string, string>;
};

/**
 * Result type for signUp method.
 */
export type SignUpResult = {
  userConfirmed: boolean | undefined;
  /**
   * Cognito sub (unique identifier) for the user.
   */
  sub: string | undefined;
};

/**
 * Parameters for forgotPassword method.
 */
export type ForgotPasswordParams = {
  username: string;
};

/**
 * Result type for forgotPassword method.
 */
export type ForgotPasswordResult = {
  codeDeliveryDetails?: {
    destination?: string;
    deliveryMedium?: string;
    attributeName?: string;
  };
};

/**
 * Parameters for confirmForgotPassword method.
 */
export type ConfirmForgotPasswordParams = {
  username: string;
  code: string;
  newPassword: string;
};

/**
 * Result type for confirmForgotPassword method.
 */
export type ConfirmForgotPasswordResult = {
  success: boolean;
};

/**
 * Parameters for resendConfirmationCode method.
 */
export type ResendConfirmationCodeParams = {
  username: string;
};

/**
 * Result type for resendConfirmationCode method.
 */
export type ResendConfirmationCodeResult = {
  codeDeliveryDetails?: {
    destination?: string;
    deliveryMedium?: string;
    attributeName?: string;
  };
};

/**
 * Parameters for changePassword method.
 */
export type ChangePasswordParams = {
  accessToken: string;
  previousPassword: string;
  proposedPassword: string;
};

/**
 * Result type for changePassword method.
 */
export type ChangePasswordResult = {
  success: boolean;
};

/**
 * Parameters for confirmSignUp method.
 */
export type ConfirmSignUpParams = {
  username: string;
  code: string;
};

/**
 * Result type for confirmSignUp method.
 */
export type ConfirmSignUpResult = {
  success: boolean;
};

/**
 * Parameters for signOut method.
 */
export type SignOutParams = {
  accessToken: string;
};

/**
 * Result type for signOut method.
 */
export type SignOutResult = {
  success: boolean;
};

/**
 * Parameters for refreshToken method.
 */
export type RefreshTokenParams = {
  refreshToken: string;
  clientId: string;
};

/**
 * Result type for refreshToken method.
 */
export type RefreshTokenResult = {
  accessToken: string;
  idToken?: string;
  expiresIn?: number;
  tokenType?: string;
};

/**
 * Parameters for signin method (USER_PASSWORD_AUTH).
 */
export type SigninParams = {
  username: string;
  password: string;
};

/**
 * Result type for signin method.
 */
export type SigninResult = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn?: number;
  tokenType?: string;
};

/**
 * Parameters for getUser method (self-service, by access token).
 */
export type GetUserParams = {
  accessToken: string;
};

/**
 * Result type for getUser method.
 */
export type GetUserResult = {
  username: string;
  userStatus?: string;
  enabled?: boolean;
  userCreateDate?: Date;
  userLastModifiedDate?: Date;
  attributes: Record<string, string>;
};

/**
 * Parameters for updateUserAttributes method (self-service).
 */
export type UpdateUserAttributesParams = {
  accessToken: string;
  attributes: Record<string, string>;
};

/**
 * Result type for updateUserAttributes method.
 */
export type UpdateUserAttributesResult = {
  success: boolean;
};

/**
 * Parameters for deleteUser method (self-service).
 */
export type DeleteUserParams = {
  accessToken: string;
};

/**
 * Result type for deleteUser method.
 */
export type DeleteUserResult = {
  success: boolean;
};

// For backwards compatibility with AWS SDK
/**
 * @deprecated Use SigninParams instead
 */
export type LoginParams = SigninParams;

/**
 * @deprecated Use SigninResult instead
 */
export type LoginResult = SigninResult;
