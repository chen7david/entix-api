/**
 * Parameters for listUsers method.
 */
export type ListUsersParams = {
  limit?: number;
  paginationToken?: string;
  filter?: string;
};

/**
 * Result type for listUsers method.
 */
export type ListUsersResult = {
  users: UserType[];
  paginationToken?: string;
};

/**
 * User type returned from Cognito.
 */
export type UserType = {
  username: string;
  userStatus?: string;
  enabled?: boolean;
  userCreateDate?: Date;
  userLastModifiedDate?: Date;
  attributes: Record<string, string>;
};

/**
 * Parameters for adminCreateUser method.
 */
export type AdminCreateUserParams = {
  username: string;
  email: string;
  temporaryPassword?: string;
  attributes?: Record<string, string>;
  messageAction?: 'RESEND' | 'SUPPRESS';
};

/**
 * Result type for adminCreateUser method.
 */
export type AdminCreateUserResult = {
  user: UserType;
};

/**
 * Parameters for adminGetUser method.
 */
export type AdminGetUserParams = {
  username: string;
};

/**
 * Result type for adminGetUser method.
 */
export type AdminGetUserResult = {
  username: string;
  userStatus?: string;
  enabled?: boolean;
  userCreateDate?: Date;
  userLastModifiedDate?: Date;
  attributes: Record<string, string>;
};

/**
 * Parameters for adminUpdateUserAttributes method.
 */
export type AdminUpdateUserAttributesParams = {
  username: string;
  attributes: Record<string, string>;
};

/**
 * Result type for adminUpdateUserAttributes method.
 */
export type AdminUpdateUserAttributesResult = {
  success: boolean;
};

/**
 * Parameters for adminDeleteUser method.
 */
export type AdminDeleteUserParams = {
  username: string;
};

/**
 * Result type for adminDeleteUser method.
 */
export type AdminDeleteUserResult = {
  success: boolean;
};

/**
 * Parameters for adminDisableUser method.
 */
export type AdminDisableUserParams = {
  username: string;
};

/**
 * Result type for adminDisableUser method.
 */
export type AdminDisableUserResult = {
  success: boolean;
};

/**
 * Parameters for adminEnableUser method.
 */
export type AdminEnableUserParams = {
  username: string;
};

/**
 * Result type for adminEnableUser method.
 */
export type AdminEnableUserResult = {
  success: boolean;
};

/**
 * Parameters for adminResetUserPassword method.
 */
export type AdminResetUserPasswordParams = {
  username: string;
};

/**
 * Result type for adminResetUserPassword method.
 */
export type AdminResetUserPasswordResult = {
  success: boolean;
};

/**
 * Parameters for adminSetUserPassword method.
 */
export type AdminSetUserPasswordParams = {
  username: string;
  password: string;
  permanent: boolean;
};

/**
 * Result type for adminSetUserPassword method.
 */
export type AdminSetUserPasswordResult = {
  success: boolean;
};

/**
 * Parameters for adminConfirmSignUp method.
 */
export type AdminConfirmSignUpParams = {
  username: string;
};

/**
 * Result type for adminConfirmSignUp method.
 */
export type AdminConfirmSignUpResult = {
  success: boolean;
};

/**
 * Parameters for adminAddUserToGroup method.
 */
export type AdminAddUserToGroupParams = {
  username: string;
  groupName: string;
};

/**
 * Result type for adminAddUserToGroup method.
 */
export type AdminAddUserToGroupResult = {
  success: boolean;
};

/**
 * Parameters for adminRemoveUserFromGroup method.
 */
export type AdminRemoveUserFromGroupParams = {
  username: string;
  groupName: string;
};

/**
 * Result type for adminRemoveUserFromGroup method.
 */
export type AdminRemoveUserFromGroupResult = {
  success: boolean;
};

/**
 * Parameters for createGroup method.
 */
export type CreateGroupParams = {
  groupName: string;
  description?: string;
  precedence?: number;
  roleArn?: string;
};

/**
 * Result type for createGroup method.
 */
export type CreateGroupResult = {
  group: GroupType;
};

/**
 * Parameters for updateGroup method.
 */
export type UpdateGroupParams = {
  groupName: string;
  description?: string;
  precedence?: number;
  roleArn?: string;
};

/**
 * Result type for updateGroup method.
 */
export type UpdateGroupResult = {
  group: GroupType;
};

/**
 * Parameters for deleteGroup method.
 */
export type DeleteGroupParams = {
  groupName: string;
};

/**
 * Result type for deleteGroup method.
 */
export type DeleteGroupResult = {
  success: boolean;
};

/**
 * Parameters for listGroups method.
 */
export type ListGroupsParams = {
  limit?: number;
  nextToken?: string;
};

/**
 * Result type for listGroups method.
 */
export type ListGroupsResult = {
  groups: GroupType[];
  nextToken?: string;
};

/**
 * Group type returned from Cognito.
 */
export type GroupType = {
  groupName: string;
  description?: string;
  precedence?: number;
  roleArn?: string;
  creationDate?: Date;
  lastModifiedDate?: Date;
};

/**
 * Parameters for adminInitiateAuth method.
 */
export type AdminInitiateAuthParams = {
  username: string;
  password: string;
};

/**
 * Result type for adminInitiateAuth method.
 */
export type AdminInitiateAuthResult = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn?: number;
  tokenType?: string;
};

/**
 * Parameters for adminListGroupsForUser method.
 */
export type AdminListGroupsForUserParams = {
  username: string;
  limit?: number;
  nextToken?: string;
};

/**
 * Result type for adminListGroupsForUser method.
 */
export type AdminListGroupsForUserResult = {
  groups: GroupType[];
  nextToken?: string;
};

/**
 * Parameters for listUsersInGroup method.
 */
export type ListUsersInGroupParams = {
  groupName: string;
  limit?: number;
  nextToken?: string;
};

/**
 * Result type for listUsersInGroup method.
 */
export type ListUsersInGroupResult = {
  users: UserType[];
  nextToken?: string;
};
