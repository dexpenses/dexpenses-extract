export function desc() {
  return descBy((x: number) => x);
}

export function descBy<T>(accessor: (t: T) => number) {
  return (a: T, b: T) => accessor(b) - accessor(a);
}
