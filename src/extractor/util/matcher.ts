import { Optional } from '../../Optional';

export type RegExpMatcher = RegExp & { static?: boolean };

export function statically(regex: RegExpMatcher): RegExpMatcher {
  regex.static = true;
  return regex;
}

export function tokenize(matcherChars: Set<string>, format: string): string[] {
  const tokens: string[] = [];
  let currentToken = '';
  for (const c of format) {
    if (matcherChars.has(c) && (!currentToken || c === currentToken[0])) {
      currentToken += c;
    } else {
      tokens.push(currentToken);
      currentToken = c;
    }
  }
  if (currentToken) {
    tokens.push(currentToken);
  }
  return tokens;
}

export function escape(token: string): string {
  return token.replace(/\\/g, '\\\\'); // escape backslash
}

export function buildMatcherDef(
  matchers: Record<string, RegExpMatcher>,
  matcherChars: Set<string>,
  format: string
): MatcherDef {
  const tokens = tokenize(matcherChars, format);
  return {
    format,
    tokens,
    regex: new RegExp(
      tokens
        .map((token) =>
          matchers[token] ? matchers[token].source : escape(token)
        )
        .join(''),
      'm'
    ),
  };
}

interface MatcherDef {
  format: string;
  regex: RegExp;
  tokens: string[];
}

export interface MatchResult {
  def: MatcherDef;
  regexMatch: RegExpMatchArray;
  polishedMatch(): string;
}

export class Matcher {
  constructor(
    private tokenMatchers: Record<string, RegExpMatcher>,
    private matchers: MatcherDef[]
  ) {}

  exec(s: string): Optional<MatchResult> {
    for (const def of this.matchers) {
      const m = s.match(def.regex);
      if (m) {
        return new Optional({
          def,
          regexMatch: m,
          polishedMatch: () => {
            let matchIndex = 0;
            return def.tokens
              .map((token) => {
                if (
                  this.tokenMatchers[token] &&
                  !this.tokenMatchers[token].static
                ) {
                  matchIndex += 1;
                  return m[matchIndex];
                }
                return token;
              })
              .join('');
          },
        });
      }
    }
    return Optional.none();
  }
}

export function getTokenChars(tokenMatchers: Record<string, RegExpMatcher>) {
  return new Set(Object.keys(tokenMatchers).map((f) => f[0]));
}

export function createMatcher(
  tokenMatchers: Record<string, RegExpMatcher>,
  formats: string[]
): Matcher {
  const tokenChars = getTokenChars(tokenMatchers);
  return new Matcher(
    tokenMatchers,
    formats.map((format) => buildMatcherDef(tokenMatchers, tokenChars, format))
  );
}
