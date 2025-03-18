import { add } from '@src/utils/example.util';

describe('example.util', () => {
  it('add', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('db env should be devined', () => {
    expect(process.env.DB_NAME).toBeDefined();
    expect(process.env.DB_PASSWORD).toBeDefined();
    expect(process.env.DB_USER).toBeDefined();
    expect(process.env.DB_HOST).toBeDefined();
    expect(process.env.DB_PORT).toBeDefined();
    expect(process.env.MAX_POOL_SIZE).toBeDefined();
  });
});
