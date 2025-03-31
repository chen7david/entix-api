export const mockLogger = () => {
  // Don't mock the logger in its own tests
  const testPath = expect.getState().testPath || '';
  if (testPath.includes('logger.service.test.ts')) {
    return jest.requireActual('@src/services/logger.service');
  }

  const mockLogMethod = jest.fn();

  const mockLogger = {
    trace: mockLogMethod,
    debug: mockLogMethod,
    info: mockLogMethod,
    warn: mockLogMethod,
    error: mockLogMethod,
    fatal: mockLogMethod,
    child: jest.fn().mockImplementation(() => mockLogger),
  };

  return {
    logger: mockLogger,
    createLogger: jest.fn().mockReturnValue(mockLogger),
  };
};
