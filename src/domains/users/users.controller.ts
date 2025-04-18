import { Get, JsonController } from 'routing-controllers';
import { Injectable } from '@src/shared/utils/typedi/typedi.util';

@JsonController('/v1/users')
@Injectable()
export class UsersController {
  @Get('/')
  public async getUsers() {
    return {
      message: 'Hello World',
    };
  }
}
