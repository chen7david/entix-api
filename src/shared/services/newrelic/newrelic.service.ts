/**
 * Service to handle New Relic log enrichment for Pino.
 *
 * @remarks
 * This service wraps the @newrelic/pino-enricher integration and can be injected into other services.
 */
import { Injectable } from '@shared/utils/ioc.util';
import type { LoggerOptions } from 'pino';

export type EnrichLoggerOptionsParams = {
  options: LoggerOptions;
  enabled: boolean;
};

@Injectable()
export class NewRelicService {
  /**
   * Enriches Pino logger options with New Relic enrichment if enabled.
   *
   * @param params - Object containing options and enabled
   * @returns The enriched logger options if enabled, otherwise the original options
   */
  enrichLoggerOptions({ options, enabled }: EnrichLoggerOptionsParams): LoggerOptions {
    if (!enabled) return options;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nrPino = require('@newrelic/pino-enricher');
      return nrPino(options);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[NewRelicService] Failed to initialize New Relic enricher:', error);
      return options;
    }
  }
}
