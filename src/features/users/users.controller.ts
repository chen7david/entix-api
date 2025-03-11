import { JsonController, Get, Param, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { UserService } from '@src/features/users/user.service';
import { logger } from '@/services/logger.service';

@JsonController('/users')
@Service() // Important: Controllers must also be decorated with @Service
export class UsersController {
  constructor(private userService: UserService) {
    logger.debug('UsersController initialized');
  }

  @Get()
  getAll() {
    logger.debug('UsersController.getAll called');
    return this.userService.getAll();
  }

  @Get('/:id')
  getOne(@Param('id') id: number) {
    logger.debug(`UsersController.getOne called with id: ${id}`);
    const user = this.userService.getById(id);

    if (!user) {
      throw new NotFoundError(`User with id ${id} not found`);
    }

    return user;
  }
}
