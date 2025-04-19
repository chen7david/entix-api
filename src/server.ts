import { ServerService } from '@src/services/server/server.service';
import { appService } from '@src/app';
import { ConfigService } from './services/config/config.service';
import { Container } from '@src/shared/utils/typedi/typedi.util';

const configService = Container.get(ConfigService);

const server = new ServerService({
  app: appService.getApp(),
  port: configService.env.PORT,

  onListening: async ({ port, ip }) => {
    console.log(`Server is running at http://${ip}:${port}`);
  },

  onError: async (error) => {
    console.error('Server error:', error);
  },

  beforeShutdown: async () => {
    // cleanup database connections
    // cleanup redis connections
    // cleanup other connections
    // server shutdown will be handled in the server service
  },
});

server.start();
