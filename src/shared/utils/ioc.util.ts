/**
 * IoC utility module: re-exports TypeDI decorators and Injectable alias for use throughout the codebase.
 */
import { Service } from 'typedi';

export const Injectable = Service;
export * from 'typedi';
