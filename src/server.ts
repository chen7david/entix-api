import 'reflect-metadata';
import { useContainer } from 'routing-controllers';
import { Container } from '@src/shared/utils/typedi/typedi.util';
import { ServerService } from '@src/services/server/server.service';
import { appService } from '@src/app';
import { EnvService } from './services/env/env.service';
// import { EnvService } from '@src/services/env/env.service';
console.log(Container.has(EnvService));
useContainer(Container);

// const envService = Container.get(EnvService);

const server = new ServerService({
  app: appService.getApp(),
  port: 3000,

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
