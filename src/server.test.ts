import { testServer } from '@src/server';

describe('example', () => {
  it('should run', () => {
    expect(testServer()).toBe(true);
  });
});
