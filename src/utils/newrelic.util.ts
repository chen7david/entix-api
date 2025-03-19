import { Environment } from '@src/constants/app.constant';

/**
 * Initializes the New Relic agent if in production and enabled.
 */
export const initializeNewRelic = (): void => {
  if (
    process.env.NODE_ENV === Environment.DEVELOPMENT
    // &&
    // process.env.NEW_RELIC_ENABLED === 'true'
  ) {
    require('newrelic'); // Load New Relic agent
  }
};
