import 'reflect-metadata';
import { Container } from 'typedi';
import { ServerService } from '@shared/services/server/server.service';
import { CognitoModule } from '@shared/modules/cognito.module';
import { AuthModule } from '@shared/modules/auth.module';

/**
 * Entry point: bootstraps and starts the server.
 */
async function main() {
  // Register services from modules
  CognitoModule.register();
  AuthModule.register();

  const serverService = Container.get(ServerService);
  await serverService.start();
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
