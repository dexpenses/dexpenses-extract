import { intersects } from './text-range';

describe('utils/text-range/intersects', () => {
  it.each([
    // zero-length
    [[0, 0], [0, 0], false],
    [[1, 1], [1, 0], false],
    [[0, 2], [1, 0], false],
    // at the start
    [[0, 1], [1, 1], false],
    [[0, 2], [1, 1], true],
    [[0, 1], [0, 1], true],
    // in the center
    [[1, 3], [0, 1], false],
    [[1, 3], [0, 2], true],
    [[1, 3], [1, 1], true],
    [[1, 3], [2, 1], true],
    [[1, 3], [3, 1], true],
    [[1, 3], [2, 2], true],
    [[1, 3], [4, 1], false],
    // at the end
    [[1, 1], [2, 1], false],
    [[2, 1], [2, 1], true],
    [[1, 2], [2, 1], true],
    [[0, 3], [2, 1], true],
  ])('should evaluate %s and %s as %s', ([i, l], [j, k], doesIntersect) => {
    expect(intersects({ index: i, length: l }, { index: j, length: k })).toBe(
      doesIntersect
    );
    expect(intersects({ index: j, length: k }, { index: i, length: l })).toBe(
      doesIntersect
    );
  });
});
