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

// New schemas for updated endpoints

export const adminAddUserToGroupBodySchema = z.object({
  groupName: z.string().min(1),
  username: z.string().min(1),
});

export const adminRemoveUserFromGroupBodySchema = z.object({
  groupName: z.string().min(1),
  username: z.string().min(1),
});

// New schemas for new endpoints
export const listUsersInGroupQuerySchema = z.object({
  limit: z.coerce.number().int().positive().optional().describe('Number of users to return'),
  nextToken: z.string().optional().describe('Token for pagination'),
});

export class ListUsersInGroupQueryDto {
  limit?: number;
  nextToken?: string;
  public static _zodSchema = listUsersInGroupQuerySchema;
}

export const listGroupsForUserQuerySchema = z.object({
  limit: z.coerce.number().int().positive().optional().describe('Number of groups to return'),
  nextToken: z.string().optional().describe('Token for pagination'),
});

export class ListGroupsForUserQueryDto {
  limit?: number;
  nextToken?: string;
  public static _zodSchema = listGroupsForUserQuerySchema;
}

// Add URL parameter schemas
export const groupNameParamsSchema = z.object({
  groupName: z.string().min(1),
});

export const usernameParamsSchema = z.object({
  username: z.string().min(1),
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

// New types for updated endpoints
export type AdminAddUserToGroupBody = z.infer<typeof adminAddUserToGroupBodySchema>;
export type AdminRemoveUserFromGroupBody = z.infer<typeof adminRemoveUserFromGroupBodySchema>;

// New types for new endpoints
export type ListUsersInGroupQuery = z.infer<typeof listUsersInGroupQuerySchema>;
export type ListGroupsForUserQuery = z.infer<typeof listGroupsForUserQuerySchema>;
export type GroupNameParams = z.infer<typeof groupNameParamsSchema>;
export type UsernameParams = z.infer<typeof usernameParamsSchema>;

export type AdminAuthBody = z.infer<typeof adminAuthBodySchema>;

/**
 * Register all admin schemas with the OpenAPI registry.
 *
 * @param registry - The OpenAPI registry to register schemas with
 */
export function registerAdminSchemas(registry: OpenAPIRegistry): void {
  registry.register('AdminAuthHeaders', adminAuthHeadersSchema);
  registry.register('ListUsersQuery', listUsersQuerySchema);
  registry.register('ListUsersQueryDto', listUsersQuerySchema);

  registry.register('ListGroupsQuery', listGroupsQuerySchema);
  registry.register('ListGroupsQueryDto', listGroupsQuerySchema);

  registry.register('AdminCreateUserBody', adminCreateUserBodySchema);
  registry.register('AdminUpdateUserAttributesBody', adminUpdateUserAttributesBodySchema);
  registry.register('AdminSetUserPasswordBody', adminSetUserPasswordBodySchema);
  registry.register('CreateGroupBody', createGroupBodySchema);
  registry.register('UpdateGroupBody', updateGroupBodySchema);
  registry.register('AdminAuthBody', adminAuthBodySchema);

  // Register new schemas
  registry.register('AdminAddUserToGroupBody', adminAddUserToGroupBodySchema);
  registry.register('AdminRemoveUserFromGroupBody', adminRemoveUserFromGroupBodySchema);
  registry.register('ListUsersInGroupQuery', listUsersInGroupQuerySchema);
  registry.register('ListUsersInGroupQueryDto', listUsersInGroupQuerySchema);
  registry.register('ListGroupsForUserQuery', listGroupsForUserQuerySchema);
  registry.register('ListGroupsForUserQueryDto', listGroupsForUserQuerySchema);

  // Add URL parameter schemas
  registry.register('GroupNameParams', groupNameParamsSchema);
  registry.register('UsernameParams', usernameParamsSchema);
}
