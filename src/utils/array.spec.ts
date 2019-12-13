import { desc, descBy } from './array';

describe('utils/array/sort', () => {
  it('should work for plain numbers', () => {
    expect([1, 2, 3].sort(desc())).toEqual([3, 2, 1]);
  });

  it('should work for numbers with accessor', () => {
    expect([{ x: 1 }, { x: 2 }, { x: 3 }].sort(descBy(({ x }) => x))).toEqual([
      { x: 3 },
      { x: 2 },
      { x: 1 },
    ]);
  });
});
