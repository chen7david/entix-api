import { Injectable } from '@src/utils/typedi.util';
import { logger } from '@src/services/logger.service';

/**
 * Service providing test functionality for the example domain
 */
@Injectable()
export class TestService {
  /**
   * Returns a simple test message
   * @returns Object with a message string
   */
  getMessage(): { message: string } {
    logger.debug('TestService.getMessage called');
    return { message: 'Test controller is working!' };
  }

  /**
   * Creates a greeting message based on the provided name
   * @param name - Optional name to personalize the greeting
   * @returns Object with a greeting string
   */
  getGreeting(name?: string): { greeting: string } {
    logger.debug(`TestService.getGreeting called with name: ${name || 'undefined'}`);
    return { greeting: name ? `Hello, ${name}!` : 'Hello, World!' };
  }

  /**
   * Gets information for an entity by ID
   * @param id - The entity ID
   * @returns Object with the ID and timestamp
   */
  getById(id: string): { id: string; timestamp: string } {
    logger.debug(`TestService.getById called with id: ${id}`);
    return {
      id,
      timestamp: new Date().toISOString(),
    };
  }
}
