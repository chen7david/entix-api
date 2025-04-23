import { z, ZodTypeAny, ZodError } from 'zod';
import { extendZodWithOpenApi } from '@asteasolutions/zod-to-openapi';

// Extend Zod with the .openapi() helper
extendZodWithOpenApi(z);

// Re-export z, ZodTypeAny, ZodError for shared usage
export { z, ZodTypeAny, ZodError };
