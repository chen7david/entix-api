/**
 * @file Dummy tests to verify Jest path aliasing with @src works as expected.
 */
import { hello } from '@src/server';

describe('Jest @src path aliasing', () => {
  it('should import hello from @src/server without error', () => {
    expect(typeof hello).toBe('function');
  });

  it('should call hello and not throw', () => {
    expect(() => hello()).not.toThrow();
  });
});
