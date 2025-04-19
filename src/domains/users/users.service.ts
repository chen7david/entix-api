import { ConfigService } from '@src/services/config/config.service';
import { LoggerService } from '@src/services/logger/logger.service';
import { Injectable } from '@src/shared/utils/typedi/typedi.util';

@Injectable()
export class UsersService {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: LoggerService
  ) {}

  async getUsers() {
    const env = this.configService.env;
    this.logger.info('crazy fish', env);
    return [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Doe' },
    ];
  }
}
