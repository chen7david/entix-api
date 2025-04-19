import { LoggerFactory } from '@src/services/logger/logger.factory';
import { Injectable } from '@src/shared/utils/typedi/typedi.util';

@Injectable()
export class UsersService {
  constructor(private readonly logger: LoggerFactory) {}

  async getUsers() {
    this.logger.createLogger().info('Getting users');
    return [
      {
        id: 1,
        name: 'John Doe',
      },
      {
        id: 2,
        name: 'Jane Doe',
      },
    ];
  }
}
