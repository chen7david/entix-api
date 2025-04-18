import { EnvLoader } from '@src/shared/utils/env-loader/env-loader.util';
import { appConfigSchema } from './schema.config';

export const envLoader = new EnvLoader(appConfigSchema);
export const env = envLoader.env;
