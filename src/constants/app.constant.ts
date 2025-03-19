export enum Environment {
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  TEST = 'test',
}

export enum EnvFilename {
  DEVELOPMENT = '.env',
  TEST = '.env.test',
}

export enum HTTPMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  OPTIONS = 'OPTIONS',
}

export enum HTTPHeaders {
  CONTENT_TYPE = 'Content-Type',
  AUTHORIZATION = 'Authorization',
  ACCEPT = 'Accept',
  X_REQUESTED_WITH = 'X-Requested-With',
}
