import { logger } from '@core/utils/logger.util';

describe('Example', () => {
  it('example test', async () => {
    expect(logger.info).toBeDefined();
    expect(logger.error).toBeDefined();
    expect(logger.warn).toBeDefined();
    expect(logger.debug).toBeDefined();
    expect(logger.trace).toBeDefined();
  });
});
