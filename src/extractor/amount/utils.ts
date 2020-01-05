export function equal(x: number, y: number) {
  return Number(Math.abs(x - y).toFixed(2)) < Number.EPSILON;
}

export function floor(r: number): number {
  return Math.floor(r * 100) / 100;
}

export function round(r: number): number {
  return Math.round(r * 100) / 100;
}
