import 'reflect-metadata';
import { HealthController } from '@domains/health/health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('should return status ok with message and valid timestamp', () => {
    const result = controller.health();
    expect(result).toHaveProperty('status', 'ok');
    expect(result).toHaveProperty('message', 'API is running');
    expect(typeof result.timestamp).toBe('string');
    // timestamp should be valid ISO string
    expect(new Date(result.timestamp).toISOString()).toBe(result.timestamp);
  });
});
