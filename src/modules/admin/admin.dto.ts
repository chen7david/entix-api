import { z } from '@core/utils/zod.util';

export const AdminUserAttributesDto = z.object({
  email: z.string(),
  emailVerified: z.string(),
  sub: z.string(),
});

export type AdminUserAttributesDto = z.infer<typeof AdminUserAttributesDto>;

const AdminUserDto = z.object({
  username: z.string(),
  userCreateDate: z.date(),
  userLastModifiedDate: z.date(),
  enabled: z.boolean(),
  userStatus: z.string(),
  userAttributes: AdminUserAttributesDto,
});

export const AdminListUsersResponseDto = z.object({
  users: z.array(AdminUserDto),
  paginationToken: z.string().optional(),
});

export type AdminListUsersResponseDto = z.infer<typeof AdminListUsersResponseDto>;

export const AdminDeleteUserParamsDto = z.object({
  username: z.string(),
});

export type AdminDeleteUserParamsDto = z.infer<typeof AdminDeleteUserParamsDto>;
