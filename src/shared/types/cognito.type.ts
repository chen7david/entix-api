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
 * Parameters for adminCreateUser method.
 */
export type AdminCreateUserParams = {
  username: string;
  email: string;
  temporaryPassword?: string;
  attributes?: Record<string, string>;
};

/**
 * Result type for adminCreateUser method.
 */
export type AdminCreateUserResult = {
  /**
   * Cognito sub (unique identifier) for the user.
   */
  sub: string | undefined;
  userStatus: string | undefined;
};

/**
 * Parameters for adminInitiateAuth method.
 */
export type AdminInitiateAuthParams = {
  username: string;
  password: string;
};

/**
 * Result type for adminInitiateAuth method.
 */
export type AdminInitiateAuthResult = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn?: number;
  tokenType?: string;
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
 * Parameters for adminGetUser method.
 */
export type AdminGetUserParams = {
  username: string;
};

/**
 * Result type for adminGetUser method.
 */
export type AdminGetUserResult = {
  username: string;
  userStatus: string;
  enabled: boolean;
  userCreateDate?: Date;
  userLastModifiedDate?: Date;
  attributes: Record<string, string>;
};

/**
 * Parameters for adminUpdateUserAttributes method.
 */
export type AdminUpdateUserAttributesParams = {
  username: string;
  attributes: Record<string, string>;
};

/**
 * Result type for adminUpdateUserAttributes method.
 */
export type AdminUpdateUserAttributesResult = {
  success: boolean;
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
