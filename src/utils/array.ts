export function desc() {
  return descBy((x: number) => x);
}

export function descBy<T>(accessor: (t: T) => number) {
  return (a: T, b: T) => accessor(b) - accessor(a);
}

export function max() {
  return (tmpMax: number | null, cur: number) =>
    tmpMax == null || tmpMax < cur ? cur : tmpMax;
}

export interface Max<T> {
  max: number;
  values: T[];
}

export function maxBy<T>(accessor: (t: T) => number) {
  return (acc: Max<T> | null, cur: T) => {
    const value = accessor(cur);
    if (acc == null || value > acc.max) {
      return {
        max: value,
        values: [cur],
      };
    }
    if (value === acc.max) {
      acc.values.push(cur);
    }
    return acc;
  };
}

export function getMostFrequent<T>(arr: T[]): Max<T> | null {
  const frequencies = new Map<T, number>();
  for (const e of arr) {
    frequencies.set(e, (frequencies.get(e) || 0) + 1);
  }
  const maxes = [...frequencies.entries()].reduce(
    maxBy(([, frequency]) => frequency),
    null
  );
  if (!maxes) {
    return null;
  }
  return {
    max: maxes.max,
    values: maxes.values.map(([e]) => e),
  };
}
