export const NODE_ENV = ['development', 'production', 'test'] as const;

export enum EnvFileName {
  DEVELOPMENT = '.env',
  TEST = '.env.test',
  PRODUCTION = '.env.production',
}

export const LOG_LEVEL = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'] as const;
