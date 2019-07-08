import { regexTrim, getAllMatches } from './regex-utils';

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
    expect(getAllMatches(/[a-z]/g, 'a2bc4.-d').map(([m]) => m)).toEqual(
      Array.from('abcd')
    );
  });

  it('should return zero-width match once', () => {
    expect(getAllMatches(/$/, '')).toEqual([''.match(/$/)]);
    expect(getAllMatches(/^/, '')).toEqual([''.match(/^/)]);

    expect(getAllMatches(/\s*/, '     ')).toEqual(['     '.match(/\s*/)]);
  });
});
