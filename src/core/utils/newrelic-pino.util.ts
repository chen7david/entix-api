import type { LoggerOptions } from 'pino';

export function enrichWithNewRelic(options: LoggerOptions): LoggerOptions {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nrPino = require('@newrelic/pino-enricher');
    return nrPino(options);
  } catch (e) {
    console.error('Failed to load New Relic enricher:', e);
    return options;
  }
}
