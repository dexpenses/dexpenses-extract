import Scanner from '../scanner';

export type TokenType = 'WHITESPACE' | 'MATCHER' | 'TEXT' | 'LITERAL';
interface Token {
  type: TokenType;
  token: string;
}

export default function tokenize(
  format: string,
  tokenChars: Set<string>
): Token[] {
  const sc = new Scanner(format);
  const tokens: Token[] = [];
  while (sc.hasMore()) {
    if (sc.current === ' ') {
      tokens.push({ type: 'WHITESPACE', token: sc.consumeSame() });
    } else if (sc.current === "'") {
      sc.advance();
      tokens.push({ type: 'TEXT', token: "'" + sc.consumeUntil("'") + "'" });
      sc.advance();
    } else if (tokenChars.has(sc.current)) {
      tokens.push({ type: 'MATCHER', token: sc.consumeSame() });
    } else {
      tokens.push({
        type: 'LITERAL',
        token: sc.consumeUntilOneOf([...tokenChars, ' ', "'"]),
      });
    }
  }
  return tokens;
}
