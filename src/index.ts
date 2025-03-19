import { env } from '@src/config/env.config';
import { logger } from '@src/services/logger.service';

logger.info('Application initialized', {
  environment: env.NODE_ENV,
  appName: env.APP_NAME,
  newRelicEnabled: env.NEW_RELIC_ENABLED,
  someCustomField: 'someCustomValue',
});
