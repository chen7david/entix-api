import 'reflect-metadata';
import { Container } from 'typedi';
import { ServerService } from '@shared/services/server.service';

/**
 * Entry point: bootstraps and starts the server.
 */
async function main() {
  const serverService = Container.get(ServerService);
  await serverService.start();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Failed to start server:', err);
  process.exit(1);
});
