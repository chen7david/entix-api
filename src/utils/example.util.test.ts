import { add } from '@src/utils/example.util';

describe('example.util', () => {
  it('add', () => {
    expect(add(1, 2)).toBe(3);
  });

  it('db env should be devined and correct', () => {
    const DEFINED = '***'; // gitub returns "***" if a secret is defined
    expect(process.env.DB_NAME).toBe(DEFINED);
    expect(process.env.DB_PASSWORD).toBe(DEFINED);
    expect(process.env.DB_USER).toBe(DEFINED);
    expect(process.env.DB_HOST).toBe(DEFINED);
    expect(process.env.DB_PORT).toBe(DEFINED);
    expect(process.env.MAX_POOL_SIZE).toBe(DEFINED);
  });
});
