import { Get, JsonController } from 'routing-controllers';

@JsonController('/v1/users')
export class UsersController {
  @Get('/')
  public async getUsers() {
    return {
      message: 'Hello World',
    };
  }
}
