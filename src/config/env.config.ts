import { EnvLoader } from '@src/services/env-loader/env-loader.service';
import { appConfigSchema } from './schema.config';

export const envLoader = new EnvLoader(appConfigSchema);
export const env = envLoader.env;
