import * as userSchema from '@domains/user/user.schema';
// Import other domain schemas here if they exist
// e.g., import * as productSchema from '@domains/product/product.schema';

/**
 * Combined schema object for Drizzle ORM, aggregating schemas from all domains.
 */
export const schema = {
  ...userSchema,
  // ...productSchema,
};

/**
 * Type representing the combined application schema.
 */
export type AppSchema = typeof schema;
