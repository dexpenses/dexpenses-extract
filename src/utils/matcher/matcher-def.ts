export type RegExpMatcher = RegExp & {
  static?: string | boolean;
  sanityCheck?: (match: string) => boolean;
};

export function statically(
  regex: RegExpMatcher,
  staticToken?: string
): RegExpMatcher {
  regex.static = staticToken ? staticToken : true;
  return regex;
}

export function withSanityCheck(
  regex: RegExpMatcher,
  check: (match: string) => boolean
): RegExpMatcher {
  regex.sanityCheck = check;
  return regex;
}

export function withReplacements(
  regex: RegExpMatcher,
  ...replacements: Array<[string, any]>
) {
  return {
    pattern: regex,
    static: regex.static,
    check: regex.sanityCheck,
    replacements,
  };
}

type MatcherDef =
  | RegExpMatcher
  | {
      pattern: RegExp;
      static?: boolean | string;
      replacements?: Array<[string, any]>;
      check(match: string): boolean;
    };

// TODO verify that regex does not have a capture group!!

export default MatcherDef;
