export function anyMatches(s: string, patterns: RegExp[]): boolean {
  return patterns.some((p) => !!s.match(p));
}

export function getAllMatches(regex: RegExp, s: string) {
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

export function regexTrim(s: string, r: RegExp): string {
  return s
    .replace(new RegExp(`^${r.source}`, r.flags), '')
    .replace(new RegExp(`${r.source}$`, r.flags), '');
}

export function containsCaptureGroup(regex: RegExp): boolean {
  return !!regex.source.match(/\((?!\?(:|<?[=!]))/);
}
