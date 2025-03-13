import { Service } from 'typedi';
import { logger } from '@src/services/logger.service';

@Service()
export class UserService {
  constructor() {
    logger.debug('UserService initialized');
  }

  /**
   * Get all users
   * @returns Array of users
   */
  public getAll() {
    logger.debug('UserService.getAll called');
    return [
      { id: 1, name: 'John Doe' },
      { id: 2, name: 'Jane Smith' },
    ];
  }

  /**
   * Get user by ID
   * @param id User ID
   * @returns User object or undefined if not found
   */
  public getById(id: number) {
    logger.debug(`UserService.getById called with id: ${id}`);
    const users = this.getAll();
    return users.find(user => user.id === id);
  }
}
