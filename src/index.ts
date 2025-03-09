import { env } from "./config/env.config";
import { logger } from '@/services/logger.service';


const appLogger = logger.setContext('Application');

process.on('uncaughtException', (error) => {
  appLogger.fatal('Uncaught Exception', { ...error });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  appLogger.fatal('Unhandled Rejection', { reason });
  process.exit(1);
});

async function startServer() {
  try {
    const server = {}
    appLogger.info('Server started', { 
      port: env.PORT, 
      environment: env.NODE_ENV 
    });
    return server;
  } catch (error) {
    appLogger.error('Failed to start server', error as Error);
    process.exit(1);
  }
}


startServer()
