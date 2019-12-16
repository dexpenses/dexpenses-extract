import { desc, descBy, max, maxBy, getMostFrequent } from './array';

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

describe('utils/array/max', () => {
  it('should be null for empty array', () => {
    expect(([] as number[]).reduce(max(), null)).toBeNull();
  });

  it('should return the max value', () => {
    expect([1].reduce(max())).toBe(1);
    expect([1, 2].reduce(max())).toBe(2);
    expect([1, 2, 3].reduce(max())).toBe(3);
    expect([1, 3, 2].reduce(max())).toBe(3);
  });
});

describe('utils/array/maxBy', () => {
  it('should be null for an empty array', () => {
    expect(
      [].reduce(
        maxBy(() => 1),
        null
      )
    ).toBeNull();
  });

  it.each([
    [['', 'foo', 'bar'], 3],
    [['foo', 'bar', ''], 3],
    [['', 'foo', 'bar', ''], 3],
  ] as any[][])(
    'should return all maximum elements',
    (arr: string[], maxLength: number) => {
      expect(
        arr.reduce(
          maxBy((s) => s.length),
          null
        )
      ).toEqual({
        max: maxLength,
        values: arr.filter((s) => s.length === maxLength),
      });
    }
  );
});

describe('utils/array/getMostFrequent', () => {
  it('should be null for an empty array', () => {
    expect(getMostFrequent([])).toBeNull();
  });

  it('should return the most frequent elements in the number array', () => {
    expect(getMostFrequent([1, 2, 2, 3])).toEqual({ max: 2, values: [2] });
  });

  it('should return the most frequent elements in the string array', () => {
    expect(getMostFrequent(['1', '2', '2', '3'])).toEqual({
      max: 2,
      values: ['2'],
    });
  });
});
