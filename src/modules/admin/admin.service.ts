import { Injectable, Inject } from '@core/utils/di.util';
import { AdminListUsersParams, CognitoAdminClient } from 'cognito-client';
import { CognitoAdminClientToken } from '@core/constants/di-tokens.constant';

@Injectable()
export class AdminService {
  constructor(
    @Inject(CognitoAdminClientToken) private readonly cognitoAdminClient: CognitoAdminClient,
  ) {}

  async listUsers(listUsersParams: AdminListUsersParams) {
    return this.cognitoAdminClient.listUsers(listUsersParams);
  }
}
