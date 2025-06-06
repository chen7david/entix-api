import { Injectable, Inject } from '@core/utils/di.util';
import {
  AdminCreateUserParams,
  AdminDeleteUserParams,
  AdminListUsersParams,
  AdminUpdateUserAttributesParams,
  CognitoAdminClient,
} from 'cognito-client';
import { CognitoAdminClientToken } from '@core/constants/di-tokens.constant';

@Injectable()
export class AdminService {
  constructor(
    @Inject(CognitoAdminClientToken) private readonly cognitoAdminClient: CognitoAdminClient,
  ) {}

  async listUsers(listUsersParams: AdminListUsersParams) {
    return this.cognitoAdminClient.listUsers(listUsersParams);
  }

  async createUser(createUserParams: AdminCreateUserParams) {
    return this.cognitoAdminClient.createUser(createUserParams);
  }

  async updateUser(updateUserParams: AdminUpdateUserAttributesParams) {
    return this.cognitoAdminClient.updateUserAttributes(updateUserParams);
  }

  async deleteUser(deleteUserParams: AdminDeleteUserParams) {
    return this.cognitoAdminClient.deleteUser(deleteUserParams);
  }
}
