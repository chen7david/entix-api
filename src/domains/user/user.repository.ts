import { Injectable } from '@shared/utils/ioc.util';
import { DatabaseService } from '@shared/services/database/database.service';
import { LoggerService } from '@shared/services/logger/logger.service';
import { users } from '@domains/user/user.schema';
import { User, UserId } from '@domains/user/user.model';
import { BaseRepository } from '@shared/repositories/base.repository';

/**
 * Repository for user data access, extending the BaseRepository.
 * Handles specific user-related operations and provides concrete table/column info.
 */
@Injectable()
export class UserRepository extends BaseRepository<typeof users, User, UserId> {
  // Provide concrete implementations for abstract properties
  protected readonly table = users;
  protected readonly idColumn = users.id;
  // Specify the soft delete column for the User domain
  protected readonly deletedAtColumn = users.deletedAt;

  /**
   * Creates an instance of UserRepository.
   * @param dbService - The DatabaseService instance, passed to the base repository.
   * @param loggerService - The LoggerService instance for logging.
   */
  constructor(
    protected readonly dbService: DatabaseService,
    protected readonly loggerService: LoggerService,
  ) {
    super(dbService, loggerService); // Pass both services to the base class constructor
  }

  // All other basic CRUD methods (create, findById, findAll, update)
  // are inherited from BaseRepository.

  // Add any user-specific methods here if needed in the future.
  // For example:
  // async findByEmail(email: string): Promise<User | null> { ... }
}
