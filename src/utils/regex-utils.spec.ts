import {
  regexTrim,
  getAllMatches,
  containsCaptureGroup,
  captureGroupCount,
  getMatchingPatterns,
} from './regex-utils';

describe('regex-utils/regexTrim', () => {
  it('should trim correctly', () => {
    expect(regexTrim('!foo!!', /!*/)).toBe('foo');
    expect(regexTrim('!foo!', /!*/)).toBe('foo');
    expect(regexTrim('!foo', /!*/)).toBe('foo');

    expect(regexTrim('foo', /!*/)).toBe('foo');
    expect(regexTrim('!!foo!', /!*/)).toBe('foo');
    expect(regexTrim('!!foo!!', /!*/)).toBe('foo');
  });
});

describe('regex-utils/getAllMatches', () => {
  it('should return all matches', () => {
    // with global flag
    expect(getAllMatches(/[a-z]/g, 'a2bc4.-d').map(([m]) => m)).toEqual(
      Array.from('abcd')
    );

    // without the global flag
    expect(getAllMatches(/[a-z]/, 'a2bc4.-d').map(([m]) => m)).toEqual(
      Array.from('a')
    );
  });

  it('should return zero-width match once', () => {
    expect(getAllMatches(/$/, '')).toEqual([''.match(/$/)]);
    expect(getAllMatches(/^/, '')).toEqual([''.match(/^/)]);

    expect(getAllMatches(/\s*/, '     ')).toEqual(['     '.match(/\s*/)]);
  });
});

describe('regex-utils/containsCaptureGroup+captureGroupCount', () => {
  it.each([
    [/(foo)/, 1],
    [/foo(bar)/, 1],
    [/(foo)bar/, 1],
    [/^(foo|bar)/, 1],
    [/(foo|bar)$/, 1],
    [/^(foo|bar)$/, 1],
    [/(foo)(bar)/, 2],
    [/(\()/, 1],
    [/(\(\))(\))/, 2],
    [/a(bc)d(ef)g\(h\)i(j)k/, 3],
  ])('should be true for "%s"', (regex, noOfCaptureGroups) => {
    expect(containsCaptureGroup(regex)).toBe(true);
    expect(captureGroupCount(regex)).toBe(noOfCaptureGroups);
  });

  it.each([
    [/\(/],
    [/\(\)/],
    [/(?:\()/],
    [/(?:foo)/],
    [/(?!foo)/],
    [/(?<!foo)/],
    [/(?=foo)/],
    [/(?<=foo)/],
  ])('should be false for "%s"', (regex) => {
    expect(containsCaptureGroup(regex)).toBe(false);
    expect(captureGroupCount(regex)).toBe(0);
  });
});

describe('regex-utils/getMatchingPatterns', () => {
  it('should return all the matching patterns', () => {
    const matchingPatterns = getMatchingPatterns(
      [
        { pattern: /foo/, name: 'foo' },
        { pattern: /bar/, name: 'bar' },
        { pattern: /\s/, name: 'space' },
      ],
      'my foo is cool'
    );
    expect(matchingPatterns.map(({ pattern: { name } }) => name)).toEqual([
      'foo',
      'space',
    ]);
  });
});
