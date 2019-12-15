import { containsCaptureGroup } from '../regex-utils';

export type RegExpMatcher = RegExp & {
  static?: string | boolean;
};

export function statically(
  regex: RegExpMatcher,
  staticToken?: string
): RegExpMatcher {
  regex.static = staticToken ? staticToken : true;
  return regex;
}

export interface MatcherDef {
  pattern: RegExp;
  static?: boolean | string;
  replacements?: Array<[string, any]>;
  check?: (match: string) => boolean;
}

export type MatchersDef = Record<string, RegExpMatcher | MatcherDef>;
export type Matchers = Record<string, MatcherDef>;

export function parseMatcher(
  matcherDef: RegExpMatcher | MatcherDef
): MatcherDef {
  if (matcherDef instanceof RegExp) {
    matcherDef = {
      pattern: matcherDef,
      static: matcherDef.static,
    };
  }
  validateMatcherDef(matcherDef);
  return matcherDef;
}

export function parseMatchers(matchersDef: MatchersDef): Matchers {
  const matchers: Matchers = {};
  for (const [key, matcher] of Object.entries(matchersDef)) {
    matchers[key] = parseMatcher(matcher);
  }
  return matchers;
}

export function validateMatcherDef(matcherDef: MatcherDef) {
  if (containsCaptureGroup(matcherDef.pattern)) {
    throw new Error(
      `matcher pattern ${matcherDef.pattern.source} contains an illegal capture group`
    );
  }
}
