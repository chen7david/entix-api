import { z } from 'zod';

export const SignUpDto = z.object({
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
