import { Injectable } from '@shared/utils/ioc.util';
import { DatabaseService } from '@shared/services/database/database.service';
import { users } from '@domains/user/user.schema';
import { User, UserId, UserUpdatePayload } from '@domains/user/user.model';
import { createAppError, NotFoundError } from '@shared/utils/error/error.util';
import { eq } from 'drizzle-orm';

/**
 * Repository for user CRUD operations using Drizzle ORM.
 */
@Injectable()
export class UserRepository {
  constructor(private readonly dbService: DatabaseService) {}

  /**
   * Create a new user.
   */
  async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      const [user] = await this.dbService.db.insert(users).values(data).returning();
      return user as User;
    } catch (err) {
      throw createAppError(err);
    }
  }

  /**
   * Get a user by ID.
   */
  async getById(id: UserId): Promise<User> {
    const user = await this.dbService.db.select().from(users).where(eq(users.id, id));
    if (!user[0]) throw new NotFoundError('User not found');
    return user[0] as User;
  }

  /**
   * Get all users.
   */
  async getAll(): Promise<User[]> {
    return (await this.dbService.db.select().from(users)) as User[];
  }

  /**
   * Update a user by ID.
   */
  async update(id: UserId, data: UserUpdatePayload): Promise<User> {
    try {
      const [user] = await this.dbService.db
        .update(users)
        .set(data)
        .where(eq(users.id, id))
        .returning();
      if (!user) throw new NotFoundError('User not found');
      return user as User;
    } catch (err) {
      throw createAppError(err);
    }
  }

  /**
   * Delete a user by ID.
   */
  async delete(id: UserId): Promise<void> {
    try {
      const result = await this.dbService.db.delete(users).where(eq(users.id, id));
      if (result.rowCount === 0) throw new NotFoundError('User not found');
    } catch (err) {
      throw createAppError(err);
    }
  }
}
