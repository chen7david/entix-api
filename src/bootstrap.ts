import { Container } from '@src/shared/utils/typedi/typedi.util';
import { IoC } from '@src/shared/constants/ioc.constants';
import { envSchema } from '@src/config/config.schema';

// Register all DI singletons, schemas, and other dependencies here
Container.set(IoC.ENV_SCHEMA, envSchema);
