import { Injectable } from '@core/utils/di.util';
import {
  Body,
  Delete,
  Get,
  JsonController,
  Params,
  QueryParams,
  UseBefore,
} from 'routing-controllers';
import {
  validateBody,
  validateParams,
  validateQuery,
} from '@core/middleware/validation.middleware';
import { ListUsersParamsDto } from '@modules/admin/auth.dto';
import { AdminService } from '@modules/admin/admin.service';
import { AdminListUsersResponse } from 'cognito-client';
import { AdminDeleteUserParamsDto } from '@modules/admin/admin.dto';

@Injectable()
@JsonController('/v1/admin')
export class AuthController {
  constructor(private readonly adminService: AdminService) {}

  @Get('/users')
  @UseBefore(validateBody(ListUsersParamsDto))
  async listUsers(
    @QueryParams() listUsersParams: ListUsersParamsDto,
  ): Promise<AdminListUsersResponse> {
    return this.adminService.listUsers(listUsersParams);
  }

  // @Post('/users')
  // @UseBefore(validateBody(AdminCreateUserParamsDto))
  // async createUser(@Body() createUserParams: AdminCreateUserParamsDto) {
  //   return this.adminService.createUser(createUserParams);
  // }

  @Delete('/users/:username')
  @UseBefore(validateParams(AdminDeleteUserParamsDto))
  async deleteUser(@Params() deleteUserParams: AdminDeleteUserParamsDto) {
    console.log(deleteUserParams);
    return this.adminService.deleteUser(deleteUserParams);
  }
}
