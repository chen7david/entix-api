import { JsonController, Get } from 'routing-controllers';
import { Injectable } from '@shared/utils/ioc.util';

/**
 * UsersController handles user-related endpoints.
 */
@Injectable()
@JsonController('/v1/users')
export class UsersController {
  /**
   * Get all users (sample endpoint).
   */
  @Get('/')
  getAll() {
    return [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
  }
}
