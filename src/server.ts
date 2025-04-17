import { ServerService } from '@src/services/server/server.service';
import { env } from '@src/config/env.config';
import { appService } from '@src/app';

const server = new ServerService({
  app: appService.getApp(),
  port: env.PORT,
  onListening: ({ port, ip }) => {
    console.log(`Server is running on port ${port} at ${ip}`);
  },
});

server.start();
