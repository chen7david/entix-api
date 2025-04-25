import { Injectable } from '@shared/utils/ioc.util';
import { DatabaseService } from '@shared/services/database/database.service';
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
   */
  constructor(protected readonly dbService: DatabaseService) {
    super(dbService); // Call the base class constructor
  }

  // All basic CRUD methods (create, findById, findAll, update, delete with soft delete)
  // are inherited from BaseRepository.

  // Add any user-specific methods here if needed in the future.
  // For example:
  // async findByEmail(email: string): Promise<User | null> { ... }
}
