import '@config/container.config';
import { LoggerService } from '@core/services/logger.service';
import { ServerService } from '@core/services/server.service';
import { Container } from 'typedi';

// Get service instances
const loggerService = Container.get(LoggerService);
const serverService = Container.get(ServerService);

const logger = loggerService.setContext('Bootstrap');

// Function to handle graceful shutdown
const handleShutdown = (signal: string) => {
  return async () => {
    // Prevent multiple shutdown attempts
    process.removeAllListeners('SIGUSR2');
    process.removeAllListeners('SIGINT');
    process.removeAllListeners('SIGTERM');

    try {
      logger.info(`Initiating shutdown due to ${signal} signal`);
      await serverService.gracefulShutdown(signal);

      // Give a brief moment for any final logs to be written
      setTimeout(() => {
        logger.info('Exiting process');
        process.exit(0);
      }, 100);
    } catch (error) {
      logger.error('Failed to shut down gracefully', error);

      // Exit with error code after a short delay to ensure error logs are written
      setTimeout(() => {
        process.exit(1);
      }, 100);
    }
  };
};

// Process signal handlers for graceful shutdown
process.once('SIGUSR2', handleShutdown('SIGUSR2'));
process.once('SIGINT', handleShutdown('SIGINT'));
process.once('SIGTERM', handleShutdown('SIGTERM'));

// Initialize application
(async () => {
  try {
    // Initialize the server and its dependencies
    await serverService.initialize();
  } catch (error) {
    logger.error('Failed to start application', error);
    process.exit(1);
  }
})();
