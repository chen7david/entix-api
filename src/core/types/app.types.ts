import { NODE_ENV } from '@core/constants/app.constant';

export type NodeEnv = (typeof NODE_ENV)[number];

/**
 * Interface for services that need cleanup when the server shuts down
 */
export type CleanupHandler = {
  /**
   * Method to clean up resources
   */
  cleanup: () => Promise<void>;
};
