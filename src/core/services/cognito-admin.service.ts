import { CognitoAdminClientToken } from '@core/constants/di-tokens.constant';
import { Injectable, Inject } from '@core/utils/di.util';
import {
  AdminCreateUserParams,
  AdminDeleteUserParams,
  AdminListUsersParams,
  AdminUpdateUserAttributesParams,
  CognitoAdminClient,
} from 'cognito-client';

@Injectable()
export class CognitoAdminService {
  constructor(
    @Inject(CognitoAdminClientToken) private readonly cognitoAdminClient: CognitoAdminClient,
  ) {}

  async listUsers(listUsersParams: AdminListUsersParams) {
    const users = await this.cognitoAdminClient.listUsers(listUsersParams);
    return users;
  }

  async createUser(createUserParams: AdminCreateUserParams) {
    const user = await this.cognitoAdminClient.createUser(createUserParams);
    return user;
  }

  async updateUser(updateUserParams: AdminUpdateUserAttributesParams) {
    const user = await this.cognitoAdminClient.updateUserAttributes(updateUserParams);
    return user;
  }

  async deleteUser(deleteUserParams: AdminDeleteUserParams) {
    const user = await this.cognitoAdminClient.deleteUser(deleteUserParams);
    return user;
  }
}
