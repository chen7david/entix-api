import { z } from '@core/utils/zod.util';

export const SignInDto = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const SignInResponseDto = z.object({
  accessToken: z.string().min(1),
  idToken: z.string().min(1),
  refreshToken: z.string().min(1),
  expiresIn: z.number(),
  tokenType: z.string().min(1),
});

export const SignUpDto = z.object({
  username: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export const RefreshTokenDto = z.object({
  refreshToken: z.string().min(1),
});

export const GetMeDto = z.object({
  authorization: z.string().min(1),
});

export const ConfirmSignUpDto = z.object({
  username: z.string().min(1),
  confirmationCode: z.string().min(1),
});

export const ResendConfirmationCodeDto = z.object({
  username: z.string().min(1),
});

export const ForgotPasswordDto = z.object({
  username: z.string().min(1),
});

export const ConfirmForgotPasswordDto = z.object({
  username: z.string().min(1),
  confirmationCode: z.string().min(1),
  newPassword: z.string().min(1),
});

export const ChangePasswordDto = z.object({
  username: z.string().min(1),
  oldPassword: z.string().min(1),
  newPassword: z.string().min(1),
});

export type SignInResponseDto = z.infer<typeof SignInResponseDto>;
export type ChangePasswordDto = z.infer<typeof ChangePasswordDto>;
export type ForgotPasswordDto = z.infer<typeof ForgotPasswordDto>;
export type ConfirmForgotPasswordDto = z.infer<typeof ConfirmForgotPasswordDto>;
export type ResendConfirmationCodeDto = z.infer<typeof ResendConfirmationCodeDto>;
export type ConfirmSignUpDto = z.infer<typeof ConfirmSignUpDto>;
export type RefreshTokenDto = z.infer<typeof RefreshTokenDto>;
export type SignInDto = z.infer<typeof SignInDto>;
export type SignUpDto = z.infer<typeof SignUpDto>;
export type GetMeDto = z.infer<typeof GetMeDto>;
