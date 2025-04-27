/**
 * Supported request sources for validation.
 */
export type RequestSource = 'body' | 'query' | 'params' | 'headers';

/**
 * Map of Zod schemas for each request source.
 */
import type { ZodTypeAny } from 'zod';
export type ValidationSchemas = Partial<Record<RequestSource, ZodTypeAny>>;
