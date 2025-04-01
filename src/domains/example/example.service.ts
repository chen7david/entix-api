import { Injectable } from '@src/utils/di/di.util';
import { logger } from '@src/services/logger/logger.service';

/**
 * Service providing example domain functionality
 */
@Injectable()
export class ExampleService {
  /**
   * Returns a simple example message
   * @returns Object with a message string
   */
  getMessage(): { message: string } {
    logger.debug('ExampleService.getMessage called');
    return { message: 'Example service is working!' };
  }

  /**
   * Creates a greeting message based on the provided name
   * @param name - Optional name to personalize the greeting
   * @returns Object with a greeting string
   */
  getGreeting(name?: string): { greeting: string } {
    logger.debug(`ExampleService.getGreeting called with name: ${name || 'undefined'}`);
    return {
      greeting: name ? `Welcome to the example API, ${name}!` : 'Welcome to the example API!',
    };
  }

  /**
   * Gets information for an example entity by ID
   * @param id - The example entity ID
   * @returns Object with the ID and timestamp
   */
  getById(id: string): { id: string; timestamp: string; type: string } {
    logger.debug(`ExampleService.getById called with id: ${id}`);
    return {
      id,
      timestamp: new Date().toISOString(),
      type: 'example',
    };
  }
}
