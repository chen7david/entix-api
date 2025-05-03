import * as userSchema from '@domains/user/user.schema';
import * as tenantSchema from '@domains/tenant/tenant.schema';
import * as roleSchema from '@domains/role/role.schema';
import * as permissionSchema from '@domains/permission/permission.schema';
import * as userTenantRolesSchema from '@domains/join-tables/user-tenant-roles.schema';
import * as rolePermissionsSchema from '@domains/join-tables/role-permissions.schema';
// Import other domain schemas here if they exist
// e.g., import * as productSchema from '@domains/product/product.schema';

/**
 * Combined schema object for Drizzle ORM, aggregating schemas from all domains.
 */
export const schema = {
  ...userSchema,
  ...tenantSchema,
  ...roleSchema,
  ...permissionSchema,
  ...userTenantRolesSchema,
  ...rolePermissionsSchema,
  // ...productSchema,
};

/**
 * Type representing the combined application schema.
 */
export type AppSchema = typeof schema;
