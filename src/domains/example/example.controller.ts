import { logger } from '@src/services/logger/logger.service';
import { JsonController, Get, Param, QueryParam } from 'routing-controllers';
import { Injectable } from '@src/utils/di/di.util';
import { ExampleService } from '@src/domains/example/example.service';

/**
 * Example controller demonstrating basic REST endpoints
 */
@JsonController('/v1/examples')
@Injectable()
export class ExampleController {
  /**
   * Creates a new ExampleController instance
   * @param exampleService - The example service for business logic
   */
  constructor(private exampleService: ExampleService) {}

  /**
   * Lists all examples
   * @returns Object with status message
   */
  @Get('/')
  getAll(): { message: string } {
    logger.info('ExampleController.getAll called');
    return this.exampleService.getMessage();
  }

  /**
   * Endpoint with a query parameter for greeting
   * @param name - Optional name query parameter
   * @returns Greeting message
   */
  @Get('/greeting')
  getGreeting(@QueryParam('name') name?: string): { greeting: string } {
    logger.info(`ExampleController.getGreeting called with name: ${name || 'undefined'}`);
    return this.exampleService.getGreeting(name);
  }

  /**
   * Retrieves a specific example by ID
   * @param id - The ID parameter from the URL
   * @returns Object with the provided ID and metadata
   */
  @Get('/:id')
  getOne(@Param('id') id: string): { id: string; timestamp: string; type: string } {
    logger.info(`ExampleController.getOne called with id ${id}`);
    return this.exampleService.getById(id);
  }
}
