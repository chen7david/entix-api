import { z } from '@core/utils/zod.util';

export const ListUsersParamsDto = z.object({
  limit: z.number().min(1).max(100).optional(),
  filter: z.string().optional(),
  paginationToken: z.string().optional(),
});

export type ListUsersParamsDto = z.infer<typeof ListUsersParamsDto>;
