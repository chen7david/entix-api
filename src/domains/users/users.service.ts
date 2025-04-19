import { ConfigService } from '@src/services/config/config.service';
import { Injectable } from '@src/shared/utils/typedi/typedi.util';

@Injectable()
export class UsersService {
  constructor(private readonly configService: ConfigService) {}

  async getUsers() {
    const env = this.configService.env;
    console.log(env);
    return [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Doe' },
    ];
  }
}
