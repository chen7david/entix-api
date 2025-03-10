export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export enum EnvFile {
  DevelopmentEnv = '.env',
  TestEnv = '.env.test',
}

export enum HTTPMethod {
  Get = 'GET',
  Post = 'POST',
  Put = 'PUT',
  Delete = 'DELETE',
  Patch = 'PATCH',
  Options = 'OPTIONS',
}

export enum HTTPHeaders {
  ContentType = 'Content-Type',
  Authorization = 'Authorization',
  Accept = 'Accept',
  XRequestedWith = 'X-Requested-With',
}
