import { CognitoAdminClientToken } from '@core/constants/di-tokens.constant';
import { Injectable, Inject } from '@core/utils/di.util';
import { AdminListUsersParams, CognitoAdminClient } from 'cognito-client';

@Injectable()
export class CognitoAdminService {
  constructor(
    @Inject(CognitoAdminClientToken) private readonly cognitoAdminClient: CognitoAdminClient,
  ) {}

  async listUsers(listUsersParams: AdminListUsersParams) {
    const users = await this.cognitoAdminClient.listUsers(listUsersParams);
    return users;
  }
}
