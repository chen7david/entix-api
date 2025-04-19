import { Get, JsonController } from 'routing-controllers';
import { Injectable } from '@src/shared/utils/typedi/typedi.util';
import { UsersService } from './users.service';

@JsonController('/v1/users')
@Injectable()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/')
  public async getUsers() {
    return this.usersService.getUsers();
    // return 'Hello World';
  }
}
