import { logger } from '@src/services/logger.service';
import { JsonController, Get, Param, QueryParam } from 'routing-controllers';
import { Injectable } from '@src/utils/typedi.util';
import { TestService } from '@src/domains/example/example.service';

/**
 * Test controller for demonstration purposes
 */
@JsonController('/test')
@Injectable()
export class TestController {
  /**
   * Creates a new TestController instance
   * @param testService - The test service for business logic
   */
  constructor(private testService: TestService) {}

  /**
   * Simple health check endpoint
   * @returns Object with status message
   */
  @Get('/')
  getAll(): { message: string } {
    logger.info('TestController.getAll called');
    return this.testService.getMessage();
  }

  /**
   * Endpoint with a query parameter
   * @param name - Optional name query parameter
   * @returns Greeting message
   */
  @Get('/hello')
  getGreeting(@QueryParam('name') name?: string): { greeting: string } {
    logger.info(`TestController.getGreeting called with name: ${name || 'undefined'}`);
    return this.testService.getGreeting(name);
  }

  /**
   * Endpoint with a path parameter
   * @param id - The ID parameter from the URL
   * @returns Object with the provided ID
   */
  @Get('/:id')
  getOne(@Param('id') id: string): { id: string; timestamp: string } {
    logger.info(`TestController.getOne called with id ${id}`);
    return this.testService.getById(id);
  }
}
