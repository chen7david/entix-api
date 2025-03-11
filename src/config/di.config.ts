import 'reflect-metadata';
import { Container } from 'typedi';
import { useContainer } from 'routing-controllers';
import { logger } from '@/services/logger.service';

/**
 * Initialize the dependency injection container
 * This must be called before any controllers or services are imported
 */
export function initializeContainer(): void {
  // Configure routing-controllers to use TypeDI container
  useContainer(Container);

  logger.info('Dependency injection container initialized');
}

export { Container };
