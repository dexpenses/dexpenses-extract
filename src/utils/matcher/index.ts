import { getAllMatches } from '../regex-utils';
import tokenize from './tokenize';
import MatcherDef from './matcher-def';
import Token, {
  whitespaceToken,
  textToken,
  regexToken,
  matcherToken,
} from './token';

interface Format {
  format: string;
  tokens: Token[];
  regex: RegExp;
}

export interface Match {
  format: string;
  result: string;
  match: RegExpMatchArray;
}

export default class Matcher {
  formats: Format[];

  constructor(private matchers: Record<string, MatcherDef>, formats: string[]) {
    const matcherChars = new Set(Object.keys(matchers).map(([c]) => c));
    this.formats = formats.map((format) => {
      const tokens = this._tokenize(format, matcherChars);
      return {
        format,
        tokens,
        regex: new RegExp(
          tokens.map((token) => `(${token.regex.source})`).join(''),
          'mig'
        ),
      };
    });
  }

  match(text: string) {
    const matches: Match[] = [];
    for (const format of this.formats) {
      for (const match of getAllMatches(format.regex, text)) {
        const groups = match
          .slice(1)
          .map((group, i) => format.tokens[i].getMatch(group));

        matches.push({
          match,
          format: format.format,
          result: groups.join(''),
        });
      }
    }
    if (matches.length === 0) {
      return null;
    }
    return matches;
  }

  private _tokenize(format: string, matcherChars: Set<string>): Token[] {
    return tokenize(format, matcherChars).map(({ type, token }) => {
      switch (type) {
        case 'WHITESPACE':
          return whitespaceToken(token);
        case 'TEXT':
          return textToken(token, true);
        case 'LITERAL':
          return textToken(token, false);
        case 'MATCHER':
          return this._matcher(token);
        default:
          throw new Error('cannot happen');
      }
    });
  }

  private _matcher(token: string) {
    const matcher = this.matchers[token];
    if (matcher instanceof RegExp) {
      return regexToken(token, matcher, matcher.static, matcher.sanityCheck);
    }
    return matcherToken(
      token,
      matcher.pattern,
      (m: string) => {
        if (matcher.static === true) {
          return token;
        }
        if (matcher.static) {
          return matcher.static;
        }
        let res = m;
        for (const [original, replacement] of matcher.replacements || []) {
          res = res.replace(new RegExp(original, 'ig'), replacement);
        }
        return res;
      },
      matcher.check
    );
  }
}
