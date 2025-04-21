import { JsonController, Get, UseBefore, Post, Body } from 'routing-controllers';
import { Injectable } from '@shared/utils/ioc.util';
import { LoggerService, Logger } from '@shared/services/logger/logger.service';
import { validateBody } from '@shared/middleware/validation.middleware';
import { CreateUserDto } from '@domains/user/user.dto';
/**
 * UsersController handles user-related endpoints.
 */
@Injectable()
@JsonController('/v1/users')
export class UsersController {
  private readonly logger: Logger;

  constructor(private readonly loggerService: LoggerService) {
    this.logger = this.loggerService.child({ controller: 'UsersController' });
  }
  /**
   * Get all users (sample endpoint).
   */
  @Get('/')
  async getAll(): Promise<{ id: number; name: string }[]> {
    this.logger.info('called getAll from the UsersController');
    return [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ];
  }

  /**
   * Get all users (sample endpoint).
   */
  @Post('/')
  @UseBefore(validateBody(CreateUserDto))
  async create(@Body() createUserDto: CreateUserDto): Promise<CreateUserDto[]> {
    this.logger.info('called create from the UsersController');
    return [createUserDto];
  }
}
