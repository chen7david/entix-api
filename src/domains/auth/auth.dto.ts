import { z } from '@shared/utils/zod.util';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

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

/**
 * Zod schema for confirmSignUp request body.
 */
export const confirmSignUpBodySchema = z.object({
  username: z.string().min(3),
  code: z.string().min(1),
});

/**
 * Type for confirmSignUp request body.
 */
export type ConfirmSignUpBody = z.infer<typeof confirmSignUpBodySchema>;

/**
 * Zod schema for signOut request body.
 */
export const signOutBodySchema = z.object({
  accessToken: z.string().min(1),
});

/**
 * Type for signOut request body.
 */
export type SignOutBody = z.infer<typeof signOutBodySchema>;

/**
 * Zod schema for refreshToken request body.
 */
export const refreshTokenBodySchema = z.object({
  refreshToken: z.string().min(1),
  clientId: z.string().min(1),
});

/**
 * Type for refreshToken request body.
 */
export type RefreshTokenBody = z.infer<typeof refreshTokenBodySchema>;

/**
 * Zod schema for sign-in request body.
 */
export const signInBodySchema = z.object({
  username: z.string().min(3),
  password: z.string().min(8),
});

/**
 * Type for sign-in request body.
 */
export type SignInBody = z.infer<typeof signInBodySchema>;

/**
 * Zod schema for getMe request headers (access token required).
 */
export const getMeHeadersSchema = z.object({
  authorization: z.string().min(1),
});

/**
 * Type for getMe request headers.
 */
export type GetMeHeaders = z.infer<typeof getMeHeadersSchema>;

/**
 * Zod schema for updateMe request body.
 */
export const updateMeBodySchema = z.object({
  attributes: z.record(z.string()),
});

/**
 * Type for updateMe request body.
 */
export type UpdateMeBody = z.infer<typeof updateMeBodySchema>;

/**
 * Zod schema for deleteMe request headers (access token required).
 */
export const deleteMeHeadersSchema = z.object({
  authorization: z.string().min(1),
});

/**
 * Type for deleteMe request headers.
 */
export type DeleteMeHeaders = z.infer<typeof deleteMeHeadersSchema>;

/**
 * Registers all auth Zod schemas with OpenAPI registry.
 * @param registry - The OpenAPIRegistry to add schemas to
 */
export function registerAuthSchemas(registry: OpenAPIRegistry): void {
  registry.register('SignUpBody', signUpBodySchema);
  registry.register('ForgotPasswordBody', forgotPasswordBodySchema);
  registry.register('ConfirmForgotPasswordBody', confirmForgotPasswordBodySchema);
  registry.register('ResendConfirmationCodeBody', resendConfirmationCodeBodySchema);
  registry.register('ChangePasswordBody', changePasswordBodySchema);
  registry.register('ConfirmSignUpBody', confirmSignUpBodySchema);
  registry.register('SignOutBody', signOutBodySchema);
  registry.register('RefreshTokenBody', refreshTokenBodySchema);
  registry.register('SignInBody', signInBodySchema);
  registry.register('GetMeHeaders', getMeHeadersSchema);
  registry.register('UpdateMeBody', updateMeBodySchema);
  registry.register('DeleteMeHeaders', deleteMeHeadersSchema);
}
