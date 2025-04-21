import './bootstrap';
import 'reflect-metadata';
import { registerAppServiceWithOptions } from './app';
import { Container } from '@src/shared/utils/typedi/typedi.util';
import { ServerService } from '@src/services/server/server.service';
import { LoggerService } from './services/logger/logger.service';

// registerAppServiceWithOptions();

const server = Container.get(ServerService);
const logger = Container.get(LoggerService);
const serverLogger = logger.getChildLogger({ context: 'Server' });

server.setOptions({
  onListening: async ({ port, ip }) => {
    serverLogger.info(`Server is running at http://${ip}:${port}`);
  },
  onError: async (error) => {
    logger.error('Server error:', error);
  },
  beforeShutdown: async () => {
    // cleanup database connections
    // cleanup redis connections
    // cleanup other connections
    // server shutdown will be handled in the server service
    logger.info('Server is shutting down');
  },
});

server.start();
