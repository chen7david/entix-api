import { JsonController, Get } from 'routing-controllers';
import { Injectable } from '@shared/utils/ioc.util';

/**
 * HealthController handles the /health endpoint for liveness checks.
 */
@JsonController()
@Injectable()
export class HealthController {
  /**
   * GET /health
   * @returns an object indicating the API status and timestamp.
   */
  @Get('/health')
  health() {
    return {
      status: 'ok',
      message: 'API is running',
      timestamp: new Date().toISOString(),
    };
  }
}
