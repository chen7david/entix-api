import { Injectable } from '@core/utils/di.util';
import { Get, JsonController } from 'routing-controllers';
import { UserService } from '@modules/users/user.service';

@Injectable()
@JsonController('/v1/users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  async getUsers() {
    return this.userService.getUsers();
  }
}
