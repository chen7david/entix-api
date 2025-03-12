import { Controller, Get } from 'routing-controllers';
import { logger } from '@/services/logger.service';
import { Service } from 'typedi';

@Controller('/health')
@Service()
export class HealthController {
  @Get()
  check() {
    logger.debug('Health check endpoint called');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
