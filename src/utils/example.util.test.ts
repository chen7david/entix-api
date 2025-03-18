import { add } from '@src/utils/example.util';

describe('example.util', () => {
  it('add', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('db env should be devined and correct', () => {
    expect(process.env.DB_NAME).toBe('postgres');
    expect(process.env.DB_PASSWORD).toBe('postgres');
    expect(process.env.DB_USER).toBe('postgres');
    expect(process.env.DB_HOST).toBe('localhost');
    expect(process.env.DB_PORT).toBe('5432');
    expect(process.env.MAX_POOL_SIZE).toBe('2');
  });
});
