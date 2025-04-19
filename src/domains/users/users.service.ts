import { Injectable } from '@src/shared/utils/typedi/typedi.util';
import { EnvService } from '@src/services/env/env.service';

@Injectable()
export class UsersService {
  constructor(private readonly envService: EnvService) {}

  async getUsers() {
    const env = this.envService.env;
    console.log(env);
    return [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Doe' },
    ];
  }
}
