import { Get, JsonController } from 'routing-controllers';

@JsonController('/users')
export class UsersController {
  @Get('/')
  public async getUsers() {
    return 'Hello World';
  }
}
