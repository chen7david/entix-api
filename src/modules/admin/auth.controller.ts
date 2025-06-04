import { Injectable } from '@core/utils/di.util';
import { Get, JsonController, QueryParams, UseBefore } from 'routing-controllers';
import { validateBody } from '@core/middleware/validation.middleware';
import { ListUsersParamsDto } from '@modules/admin/auth.dto';
import { AdminService } from '@modules/admin/admin.service';
import { AdminListUsersResponse } from 'cognito-client';

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
}
