import { env } from '@src/config/env.config';
import { initializeNewRelic } from '@src/utils/newrelic.util';

initializeNewRelic();

console.log(env);
