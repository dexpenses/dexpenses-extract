export default interface Token {
  regex: RegExp;
  token: string;
  getMatch(match: string): string;
  check(match: string): boolean;
}

export const whitespaceToken = (token: string) =>
  ({
    regex: / +/,
    token,
    getMatch: () => token,
    check: () => true,
  } as Token);

export function matcherToken(
  token: string,
  regex: RegExp,
  getMatch: (m: string) => string,
  check?: (m: string) => boolean
): Token {
  return {
    regex,
    token,
    getMatch,
    check: check ? check : () => true,
  };
}

export function textToken(token: string, quoted: boolean): Token {
  const text = quoted ? token.slice(1, -1) : token;
  return {
    regex: new RegExp(text),
    token,
    getMatch: () => text,
    check: () => true,
  };
}
