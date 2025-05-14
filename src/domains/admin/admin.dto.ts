import { z } from '@shared/utils/zod.util';
import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';

// Common schema for authorization headers
export const adminAuthHeadersSchema = z.object({
  authorization: z.string().startsWith('Bearer '),
});

// Users

export const listUsersQuerySchema = z.object({
  limit: z.coerce.number().int().positive().optional().describe('Number of users to return'),
  paginationToken: z.string().optional().describe('Token for pagination'),
  filter: z.string().optional().describe('Filter string for users'),
});

// Define a class for ListUsersQuery for routing-controllers
export class ListUsersQueryDto {
  limit?: number;
  paginationToken?: string;
  filter?: string;

  // Static reference to the Zod schema, can be used by validation middleware
  public static _zodSchema = listUsersQuerySchema;
}

export const adminCreateUserBodySchema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  temporaryPassword: z.string().optional(),
  attributes: z.record(z.string()).optional(),
  messageAction: z.enum(['RESEND', 'SUPPRESS']).optional(),
});

export const adminUpdateUserAttributesBodySchema = z.object({
  attributes: z.record(z.string()),
});

export const adminSetUserPasswordBodySchema = z.object({
  password: z.string().min(8),
  permanent: z.boolean(),
});

// Groups

export const listGroupsQuerySchema = z.object({
  limit: z.coerce.number().int().positive().optional().describe('Number of groups to return'),
  nextToken: z.string().optional().describe('Token for pagination'),
});

export class ListGroupsQueryDto {
  limit?: number;
  nextToken?: string;
  public static _zodSchema = listGroupsQuerySchema;
}

export const createGroupBodySchema = z.object({
  groupName: z.string().min(1),
  description: z.string().optional(),
  precedence: z.number().optional(),
  roleArn: z.string().optional(),
});

export const updateGroupBodySchema = z.object({
  description: z.string().optional(),
  precedence: z.number().optional(),
  roleArn: z.string().optional(),
});

// Authentication

export const adminAuthBodySchema = z.object({
  username: z.string().min(3),
  password: z.string().min(1),
});

// Types derived from schemas

export type AdminAuthHeaders = z.infer<typeof adminAuthHeadersSchema>;

// export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>; // Old type removed
// Controller will use ListUsersQueryDto for type hinting

export type AdminCreateUserBody = z.infer<typeof adminCreateUserBodySchema>;
export type AdminUpdateUserAttributesBody = z.infer<typeof adminUpdateUserAttributesBodySchema>;
export type AdminSetUserPasswordBody = z.infer<typeof adminSetUserPasswordBodySchema>;

export type ListGroupsQuery = z.infer<typeof listGroupsQuerySchema>;
export type CreateGroupBody = z.infer<typeof createGroupBodySchema>;
export type UpdateGroupBody = z.infer<typeof updateGroupBodySchema>;

export type AdminAuthBody = z.infer<typeof adminAuthBodySchema>;

/**
 * Register all admin schemas with the OpenAPI registry.
 *
 * @param registry - The OpenAPI registry to register schemas with
 */
export function registerAdminSchemas(registry: OpenAPIRegistry): void {
  registry.register('AdminAuthHeaders', adminAuthHeadersSchema);
  registry.register('ListUsersQuery', listUsersQuerySchema); // This is the primary registration for the schema object
  // We also register it under 'ListUsersQueryDto' so if routing-controllers-openapi looks for a schema component
  // named after the class, it finds the correct Zod-derived schema.
  registry.register('ListUsersQueryDto', listUsersQuerySchema);

  registry.register('ListGroupsQuery', listGroupsQuerySchema);
  registry.register('ListGroupsQueryDto', listGroupsQuerySchema);

  registry.register('AdminCreateUserBody', adminCreateUserBodySchema);
  registry.register('AdminUpdateUserAttributesBody', adminUpdateUserAttributesBodySchema);
  registry.register('AdminSetUserPasswordBody', adminSetUserPasswordBodySchema);
  registry.register('CreateGroupBody', createGroupBodySchema);
  registry.register('UpdateGroupBody', updateGroupBodySchema);
  registry.register('AdminAuthBody', adminAuthBodySchema);
}
