import { Container } from 'typedi';
import { initializeContainer } from '../config/di.config';
import { UserService } from '../services/user.service';

describe('Dependency Injection', () => {
  beforeAll(() => {
    // Initialize the DI container before tests
    initializeContainer();
  });

  it('should resolve services from the container', () => {
    const userService = Container.get(UserService);

    expect(userService).toBeInstanceOf(UserService);
    expect(userService.getAll()).toHaveLength(2);
  });

  it('should return the same instance for the same service', () => {
    const userService1 = Container.get(UserService);
    const userService2 = Container.get(UserService);

    expect(userService1).toBe(userService2);
  });
});
