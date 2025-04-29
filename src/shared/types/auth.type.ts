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
 * Parameters for confirmForgotPassword method.
 */
export type ConfirmForgotPasswordParams = {
  email: string;
  code: string;
  newPassword: string;
};

/**
 * Parameters for changePassword method.
 */
export type ChangePasswordParams = {
  accessToken: string;
  previousPassword: string;
  proposedPassword: string;
};
