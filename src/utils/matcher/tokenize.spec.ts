import tokenize from './tokenize';
import matchers from '../../extractor/date-time-matchers';

function matcher(token: string) {
  return { type: 'MATCHER', token };
}
function text(token: string) {
  return { type: 'TEXT', token };
}
function whitespace(token: string = ' ') {
  return {
    type: 'WHITESPACE',
    token,
  };
}

describe('The date extractor model', () => {
  it.each([
    [
      'dd.MM.yyyy',
      [
        matcher('dd'),
        matcher('.'),
        matcher('MM'),
        matcher('.'),
        matcher('yyyy'),
      ],
    ],
    ['dd-MM-yyyy', ['dd', '-', 'MM', '-', 'yyyy'].map(matcher)],
    ['dd-MM-yy', ['dd', '-', 'MM', '-', 'yy'].map(matcher)],
    ['d-M-yy', ['d', '-', 'M', '-', 'yy'].map(matcher)],
    [
      "dd.MM.yyyy 'Uhr'",
      [
        matcher('dd'),
        matcher('.'),
        matcher('MM'),
        matcher('.'),
        matcher('yyyy'),
        whitespace(),
        text("'Uhr'"),
      ],
    ],
    [
      "dd. 'des' MM 'im Jahre' yyyy",
      [
        matcher('dd'),
        matcher('.'),
        whitespace(),
        text("'des'"),
        whitespace(),
        matcher('MM'),
        whitespace(),
        text("'im Jahre'"),
        whitespace(),
        matcher('yyyy'),
      ],
    ],
  ] as any[][])('should tokenize "%s"', (format, expectedTokens) => {
    expect(
      tokenize(format as string, new Set(Object.keys(matchers).map(([c]) => c)))
    ).toEqual(expectedTokens);
  });
});
