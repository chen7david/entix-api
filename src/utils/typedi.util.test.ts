import 'reflect-metadata';
import { Container } from 'typedi';
import { Injectable } from './typedi.util';

// Test classes for dependency injection
@Injectable()
class ServiceA {
  public getValue(): string {
    return 'ServiceA Value';
  }
}

@Injectable()
class ServiceB {
  constructor(private serviceA: ServiceA) {}

  public getValueFromA(): string {
    return this.serviceA.getValue();
  }
}

@Injectable()
class ServiceC {
  constructor(
    private serviceB: ServiceB,
    private serviceA: ServiceA,
  ) {}

  public getCombinedValue(): string {
    return `${this.serviceA.getValue()} and ${this.serviceB.getValueFromA()}`;
  }
}

describe('TypeDI Container', () => {
  // Reset the container before each test
  beforeEach(() => {
    Container.reset();
  });

  it('should register and retrieve a simple service', () => {
    // Get an instance of ServiceA from the container
    const serviceA = Container.get(ServiceA);

    // Verify it's a valid instance
    expect(serviceA).toBeInstanceOf(ServiceA);
    expect(serviceA.getValue()).toBe('ServiceA Value');
  });

  it('should inject dependencies into services', () => {
    // Get an instance of ServiceB which depends on ServiceA
    const serviceB = Container.get(ServiceB);

    // Verify ServiceB received a properly injected ServiceA
    expect(serviceB).toBeInstanceOf(ServiceB);
    expect(serviceB.getValueFromA()).toBe('ServiceA Value');
  });

  it('should handle multiple dependencies', () => {
    // Get an instance of ServiceC which depends on both ServiceA and ServiceB
    const serviceC = Container.get(ServiceC);

    // Verify ServiceC received properly injected dependencies
    expect(serviceC).toBeInstanceOf(ServiceC);
    expect(serviceC.getCombinedValue()).toBe('ServiceA Value and ServiceA Value');
  });

  it('should create singletons by default', () => {
    // Get multiple instances of the same service
    const serviceA1 = Container.get(ServiceA);
    const serviceA2 = Container.get(ServiceA);

    // Verify they are the same instance (singleton)
    expect(serviceA1).toBe(serviceA2);
  });

  it('should work with our Injectable alias for Service', () => {
    // Verify that a class decorated with @Injectable() can be retrieved
    const serviceA = Container.get(ServiceA);
    expect(serviceA).toBeInstanceOf(ServiceA);

    // This test confirms that our Injectable alias is working correctly
    // If it wasn't, TypeDI wouldn't be able to find and instantiate the service
  });
});
