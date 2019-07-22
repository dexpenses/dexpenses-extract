import { Optional } from '../utils/Optional';

export function anyLineMatches<T>(
  lines: string[],
  predicate: (line: string) => T
): Optional<T> {
  for (const line of lines) {
    const value = predicate(line);
    if (value) {
      return new Optional(value);
    }
  }
  return Optional.none();
}

export function anyMatches(
  text: string,
  patterns: RegExp[]
): Optional<RegExpMatchArray> {
  for (const pattern of patterns) {
    const m = text.match(pattern);
    if (m) {
      return new Optional(m);
    }
  }
  return Optional.none();
}
