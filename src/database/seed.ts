import { DatabaseService } from '@shared/services/database/database.service';
import { ConfigService } from '@shared/services/config/config.service';
import { users } from '@domains/user/user.schema';

/**
 * Example seed script for Drizzle ORM.
 * Add your own seed logic here for each table.
 */
async function seed() {
  const configService = new ConfigService();
  const dbService = new DatabaseService(configService);

  // Example: Insert a user
  await dbService.db.insert(users).values({
    email: 'admin@example.com',
    username: 'Admin',
  });

  await dbService.cleanup();
}

seed().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', err);
  process.exit(1);
});
