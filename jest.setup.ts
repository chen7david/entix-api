import { mockLogger } from './src/__tests__/mocks/logger.mock';

/**
 * Jest setup file to configure global test environment
 */
jest.mock('@src/services/logger.service', () => mockLogger());
