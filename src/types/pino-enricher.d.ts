declare module '@newrelic/pino-enricher' {
  import { LoggerOptions } from 'pino';

  /**
   * Creates a Pino logger configuration that enriches logs with New Relic metadata
   * @param options - Pino logger options
   * @returns Enriched Pino logger options
   */
  export default function createPinoEnricher(
    options: LoggerOptions
  ): LoggerOptions;
}
