import { JsonController, Get } from 'routing-controllers';
import { Injectable } from '@shared/utils/ioc.util';
import { LoggerService, Logger } from '@src/shared/services/logger.service';

/**
 * UsersController handles user-related endpoints.
 */
@Injectable()
@JsonController('/v1/users')
export class UsersController {
  private readonly logger: Logger;

  constructor(private readonly loggerService: LoggerService) {
    this.logger = this.loggerService.child({ controller: 'UsersController' });
  }
  /**
   * Get all users (sample endpoint).
   */
  @Get('/')
  getAll() {
    this.logger.info('called getAll from the UsersController');
    return [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
  }
}
