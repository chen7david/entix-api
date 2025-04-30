/**
 * Returns a fully-typed mock database object with chainable methods for testing.
 * All methods are jest.Mock and chainable methods return the mock itself.
 * @returns {Record<string, jest.Mock>} A mock DB object with chainable methods
 */
export function createMockDb(): Record<string, jest.Mock> {
  const mock: Record<string, jest.Mock> = {
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    from: jest.fn(),
    where: jest.fn(),
    values: jest.fn(),
    set: jest.fn(),
    returning: jest.fn(),
    $dynamic: jest.fn(),
  };
  // Make all chainable methods return the mock itself
  for (const key of [
    'insert',
    'select',
    'update',
    'delete',
    'from',
    'where',
    'values',
    'set',
    '$dynamic',
  ]) {
    mock[key].mockReturnThis();
  }
  return mock;
}
