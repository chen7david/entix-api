import { z } from '@shared/utils/zod.util';

/**
 * Zod schema for signUp request body.
 */
export const signUpBodySchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  attributes: z.record(z.string()).optional(),
});

/**
 * Type for signUp request body.
 */
export type SignUpBody = z.infer<typeof signUpBodySchema>;

/**
 * Zod schema for adminCreateUser request body.
 */
export const adminCreateUserBodySchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  temporaryPassword: z.string().min(8).optional(),
  attributes: z.record(z.string()).optional(),
});

/**
 * Type for adminCreateUser request body.
 */
export type AdminCreateUserBody = z.infer<typeof adminCreateUserBodySchema>;

/**
 * Zod schema for adminInitiateAuth request body.
 */
export const adminInitiateAuthBodySchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

/**
 * Type for adminInitiateAuth request body.
 */
export type AdminInitiateAuthBody = z.infer<typeof adminInitiateAuthBodySchema>;

/**
 * Zod schema for forgotPassword request body.
 */
export const forgotPasswordBodySchema = z.object({
  username: z.string().min(3),
});

/**
 * Type for forgotPassword request body.
 */
export type ForgotPasswordBody = z.infer<typeof forgotPasswordBodySchema>;

/**
 * Zod schema for confirmForgotPassword request body.
 */
export const confirmForgotPasswordBodySchema = z.object({
  username: z.string().min(3),
  code: z.string().min(1),
  newPassword: z.string().min(8),
});

/**
 * Type for confirmForgotPassword request body.
 */
export type ConfirmForgotPasswordBody = z.infer<typeof confirmForgotPasswordBodySchema>;

/**
 * Zod schema for resendConfirmationCode request body.
 */
export const resendConfirmationCodeBodySchema = z.object({
  username: z.string().min(3),
});

/**
 * Type for resendConfirmationCode request body.
 */
export type ResendConfirmationCodeBody = z.infer<typeof resendConfirmationCodeBodySchema>;

/**
 * Zod schema for adminGetUser request params.
 */
export const adminGetUserParamsSchema = z.object({
  username: z.string().min(3),
});

/**
 * Type for adminGetUser request params.
 */
export type AdminGetUserParams = z.infer<typeof adminGetUserParamsSchema>;

/**
 * Zod schema for adminUpdateUserAttributes request body.
 */
export const adminUpdateUserAttributesBodySchema = z.object({
  username: z.string().min(3),
  attributes: z.record(z.string()),
});

/**
 * Type for adminUpdateUserAttributes request body.
 */
export type AdminUpdateUserAttributesBody = z.infer<typeof adminUpdateUserAttributesBodySchema>;

/**
 * Zod schema for changePassword request body.
 */
export const changePasswordBodySchema = z.object({
  accessToken: z.string().min(1),
  previousPassword: z.string().min(8),
  proposedPassword: z.string().min(8),
});

/**
 * Type for changePassword request body.
 */
export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;
