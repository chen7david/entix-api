import { z } from 'zod';

export const SignUpDto = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(8),
  attributes: z.record(z.string()).optional(),
});
export type SignUpDto = z.infer<typeof SignUpDto>;

export const ConfirmSignUpDto = z.object({
  email: z.string().email(),
  code: z.string(),
});
export type ConfirmSignUpDto = z.infer<typeof ConfirmSignUpDto>;

export const SignInDto = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
export type SignInDto = z.infer<typeof SignInDto>;

export const ForgotPasswordDto = z.object({
  email: z.string().email(),
});
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDto>;

export const ConfirmForgotPasswordDto = z.object({
  email: z.string().email(),
  code: z.string(),
  newPassword: z.string().min(8),
});
export type ConfirmForgotPasswordDto = z.infer<typeof ConfirmForgotPasswordDto>;

export const ResendConfirmationCodeDto = z.object({
  email: z.string().email(),
});
export type ResendConfirmationCodeDto = z.infer<typeof ResendConfirmationCodeDto>;

export const UpdateUserAttributesDto = z.object({
  accessToken: z.string(),
  attributes: z.record(z.string()),
});
export type UpdateUserAttributesDto = z.infer<typeof UpdateUserAttributesDto>;

export const ChangePasswordDto = z.object({
  accessToken: z.string(),
  previousPassword: z.string().min(8),
  proposedPassword: z.string().min(8),
});
export type ChangePasswordDto = z.infer<typeof ChangePasswordDto>;

export const SignOutDto = z.object({
  accessToken: z.string(),
});
export type SignOutDto = z.infer<typeof SignOutDto>;

export const RefreshTokenDto = z.object({
  refreshToken: z.string(),
});
export type RefreshTokenDto = z.infer<typeof RefreshTokenDto>;

/**
 * Signup response DTO (transformed from Cognito)
 */
export const SignUpResponseDto = z.object({
  userId: z.string(),
  confirmed: z.boolean(),
  codeDelivery: z
    .object({
      attribute: z.string(),
      medium: z.string(),
      destination: z.string(),
    })
    .nullable(),
});
export type SignUpResponseDto = z.infer<typeof SignUpResponseDto>;

/**
 * Signin response DTO (transformed from Cognito)
 */
export const SignInResponseDto = z.object({
  accessToken: z.string(),
  refreshToken: z.string().optional(),
  idToken: z.string().optional(),
  expiresIn: z.number().optional(),
  tokenType: z.string().optional(),
});
export type SignInResponseDto = z.infer<typeof SignInResponseDto>;

/**
 * Generic success response DTO
 */
export const SuccessResponseDto = z.object({
  success: z.boolean(),
  message: z.string().optional(),
});
export type SuccessResponseDto = z.infer<typeof SuccessResponseDto>;

/**
 * Confirm signup response DTO
 */
export const ConfirmSignUpResponseDto = SuccessResponseDto;
export type ConfirmSignUpResponseDto = z.infer<typeof ConfirmSignUpResponseDto>;

/**
 * Forgot password response DTO
 */
export const ForgotPasswordResponseDto = z.object({
  codeDelivery: z
    .object({
      attribute: z.string(),
      medium: z.string(),
      destination: z.string(),
    })
    .nullable(),
});
export type ForgotPasswordResponseDto = z.infer<typeof ForgotPasswordResponseDto>;

/**
 * Confirm forgot password response DTO
 */
export const ConfirmForgotPasswordResponseDto = SuccessResponseDto;
export type ConfirmForgotPasswordResponseDto = z.infer<typeof ConfirmForgotPasswordResponseDto>;

/**
 * Resend confirmation code response DTO
 */
export const ResendConfirmationCodeResponseDto = ForgotPasswordResponseDto;
export type ResendConfirmationCodeResponseDto = z.infer<typeof ResendConfirmationCodeResponseDto>;

/**
 * Get user attributes response DTO
 */
export const GetUserResponseDto = z.object({
  username: z.string(),
  attributes: z.record(z.string()),
});
export type GetUserResponseDto = z.infer<typeof GetUserResponseDto>;

/**
 * Update user attributes response DTO
 */
export const UpdateUserAttributesResponseDto = SuccessResponseDto;
export type UpdateUserAttributesResponseDto = z.infer<typeof UpdateUserAttributesResponseDto>;

/**
 * Change password response DTO
 */
export const ChangePasswordResponseDto = SuccessResponseDto;
export type ChangePasswordResponseDto = z.infer<typeof ChangePasswordResponseDto>;

/**
 * Sign out response DTO
 */
export const SignOutResponseDto = SuccessResponseDto;
export type SignOutResponseDto = z.infer<typeof SignOutResponseDto>;

/**
 * Refresh token response DTO (dummy)
 */
export const RefreshTokenResponseDto = z.object({
  message: z.string(),
});
export type RefreshTokenResponseDto = z.infer<typeof RefreshTokenResponseDto>;

/**
 * Registers auth-related Zod schemas with the OpenAPI registry.
 * @param registry - The OpenAPIRegistry to add schemas to
 */
export function registerAuthSchemas(
  registry: import('@asteasolutions/zod-to-openapi').OpenAPIRegistry,
): void {
  registry.register('SignUpDto', SignUpDto);
  registry.register('ConfirmSignUpDto', ConfirmSignUpDto);
  registry.register('SignInDto', SignInDto);
  registry.register('ForgotPasswordDto', ForgotPasswordDto);
  registry.register('ConfirmForgotPasswordDto', ConfirmForgotPasswordDto);
  registry.register('ResendConfirmationCodeDto', ResendConfirmationCodeDto);
  registry.register('UpdateUserAttributesDto', UpdateUserAttributesDto);
  registry.register('ChangePasswordDto', ChangePasswordDto);
  registry.register('SignOutDto', SignOutDto);
  registry.register('RefreshTokenDto', RefreshTokenDto);
  // Response DTOs
  registry.register('SignUpResponseDto', SignUpResponseDto);
  registry.register('SignInResponseDto', SignInResponseDto);
  registry.register('SuccessResponseDto', SuccessResponseDto);
  registry.register('ConfirmSignUpResponseDto', ConfirmSignUpResponseDto);
  registry.register('ForgotPasswordResponseDto', ForgotPasswordResponseDto);
  registry.register('ConfirmForgotPasswordResponseDto', ConfirmForgotPasswordResponseDto);
  registry.register('ResendConfirmationCodeResponseDto', ResendConfirmationCodeResponseDto);
  registry.register('GetUserResponseDto', GetUserResponseDto);
  registry.register('UpdateUserAttributesResponseDto', UpdateUserAttributesResponseDto);
  registry.register('ChangePasswordResponseDto', ChangePasswordResponseDto);
  registry.register('SignOutResponseDto', SignOutResponseDto);
  registry.register('RefreshTokenResponseDto', RefreshTokenResponseDto);
}
