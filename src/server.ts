import { ServerService } from '@src/services/server/server.service';
import { appService } from '@src/app';
import { ConfigService } from './services/config/config.service';
import { Container } from '@src/shared/utils/typedi/typedi.util';
import { LoggerService } from './services/logger/logger.service';

const config = Container.get(ConfigService);
const logger = Container.get(LoggerService);
const serverLogger = logger.getChildLogger({ context: 'Server' });

const server = new ServerService({
  app: appService.getApp(),
  port: config.env.PORT,

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
  },
});

server.start();
