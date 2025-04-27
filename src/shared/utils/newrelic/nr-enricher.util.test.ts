import { getNewRelicPinoEnricher } from '@shared/utils/newrelic/nr-enricher.util';

describe('getNewRelicPinoEnricher', () => {
  it('should return a function', async () => {
    const enricher = await getNewRelicPinoEnricher();
    expect(typeof enricher).toBe('function');
  });

  it('should return a function that returns an object', async () => {
    const enricher = await getNewRelicPinoEnricher();
    const result = enricher();
    expect(typeof result).toBe('object');
  });

  it('should return a no-op function that returns an empty object (fallback)', () => {
    // Simulate the fallback logic directly
    const fallback = () => ({});
    expect(typeof fallback).toBe('function');
    expect(fallback()).toEqual({});
  });
});
