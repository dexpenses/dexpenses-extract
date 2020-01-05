export function anyMatches(s: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => !!s.match(p));
}

export function getAllMatches(regex: RegExp, s: string) {
  regex = new RegExp(regex.source, regex.flags);
  let m: RegExpExecArray | null;
  const matches: RegExpExecArray[] = [];
  while ((m = regex.exec(s)) !== null) {
    matches.push(m);
    if (m.index === regex.lastIndex) {
      break;
    }
  }
  return matches;
}

export interface Pattern {
  pattern: RegExp;
}
export interface MatchingPattern<P> {
  pattern: P;
  match: RegExpMatchArray;
}

export function getMatchingPatterns<T extends Pattern>(
  patterns: T[],
  input: string
): Array<MatchingPattern<T>> {
  return patterns
    .map((p) => ({ pattern: p, match: input.match(p.pattern) }))
    .filter(((m) => m.match) as (x) => x is MatchingPattern<T>);
}

export function regexTrim(s: string, r: RegExp): string {
  return s
    .replace(new RegExp(`^${r.source}`, r.flags), '')
    .replace(new RegExp(`${r.source}$`, r.flags), '');
}

export function containsCaptureGroup(regex: RegExp): boolean {
  return captureGroupCount(regex) > 0;
}

export function captureGroupCount(regex: RegExp): number {
  return regex.source.match(/(?<!\\)\((?!\?(:|<?[=!]))/g)?.length || 0;
}
