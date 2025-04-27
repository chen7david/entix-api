/**
 * Type definitions for New Relic Pino Enricher
 * Since @newrelic/pino-enricher doesn't export its own types, we define them here.
 */

/**
 * Options for the New Relic Pino Enricher
 */
export interface NewRelicPinoEnricherOptions {
  /**
   * Additional attributes to include in every log message
   */
  attributes?: Record<string, unknown>;
}

/**
 * Function signature for the New Relic Pino Enricher
 */
export type NewRelicPinoEnricher = (
  options?: NewRelicPinoEnricherOptions,
) => Record<string, unknown>;
