import type { NewRelicPinoEnricher } from '@shared/types/newrelic.type';

/**
 * Safely imports @newrelic/pino-enricher and returns a typed enricher function.
 * If the module is not available, returns a no-op enricher.
 * This function is async to support dynamic import.
 */
export async function getNewRelicPinoEnricher(): Promise<NewRelicPinoEnricher> {
  try {
    // @ts-expect-error: No types for this optional dependency
    const mod = await import('@newrelic/pino-enricher');
    const enricher: NewRelicPinoEnricher = (
      mod && mod.default ? mod.default : mod
    ) as NewRelicPinoEnricher;
    return enricher;
  } catch {
    // Fallback: return a no-op enricher
    return () => ({});
  }
}

/**
 * Default instance of the New Relic Pino enricher as a promise.
 */
export const newRelicPinoEnricherPromise = getNewRelicPinoEnricher();
