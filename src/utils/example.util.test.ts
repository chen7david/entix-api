import { add } from '@src/utils/example.util';

describe('example.util', () => {
  it('add', () => {
    expect(add(1, 2)).toBe(3);
  });
});
