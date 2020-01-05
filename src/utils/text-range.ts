export interface TextRange {
  index: number;
  length: number;
}

export function intersects(range1: TextRange, range2: TextRange): boolean {
  if (range1.length === 0 || range2.length === 0) {
    return false;
  }
  return (
    (range1.index >= range2.index &&
      range1.index < range2.index + range2.length) ||
    (range1.index + range1.length - 1 >= range2.index &&
      range1.index + range1.length - 1 < range2.index + range2.length) ||
    (range2.index >= range1.index &&
      range2.index + range2.length - 1 <= range1.index + range1.length - 1)
  );
}

export function matchesIntersect(
  m1: RegExpMatchArray,
  m2: RegExpMatchArray
): boolean {
  return intersects(
    {
      index: m1.index!,
      length: m1[0].length,
    },
    {
      index: m2.index!,
      length: m2[0].length,
    }
  );
}
