import { EnvFile, NodeEnv } from '@shared/constants/app.constants';
import dotenv from 'dotenv';
import path from 'path';

/**
 * Loads the environment variables from the .env file.
 * @returns void
 */
export const loadEnv = () => {
  const isTest = process.env.NODE_ENV === NodeEnv.TEST;
  const envFile = isTest ? EnvFile.TEST : EnvFile.DEVELOPMENT;
  dotenv.config({ path: path.join(__dirname, '..', '..', '..', envFile) });
};
