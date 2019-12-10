import {
  tokenize,
  getTokenChars,
  buildMatcherDef,
  createMatcher,
  withSanityCheck,
} from './matcher';
import matchers from '../extractor/date-time-matchers';

const matcherChars = getTokenChars(matchers);

describe('The date extractor model', () => {
  it('should successfully tokenize "dd.MM.yyyy"', () => {
    expect(tokenize(matcherChars, 'dd.MM.yyyy')).toEqual([
      'dd',
      '.',
      'MM',
      '.',
      'yyyy',
    ]);
  });

  it('should successfully tokenize "dd-MM-yyyy"', () => {
    expect(tokenize(matcherChars, 'dd-MM-yyyy')).toEqual([
      'dd',
      '-',
      'MM',
      '-',
      'yyyy',
    ]);
  });

  it('should successfully tokenize "dd-MM-yy"', () => {
    expect(tokenize(matcherChars, 'dd-MM-yy')).toEqual([
      'dd',
      '-',
      'MM',
      '-',
      'yy',
    ]);
  });

  it('should successfully tokenize "d-M-yy"', () => {
    expect(tokenize(matcherChars, 'd-M-yy')).toEqual([
      'd',
      '-',
      'M',
      '-',
      'yy',
    ]);
  });
});

describe('The date extractor regex builder', () => {
  it('should correctly create regex for format "dd.MM.yyyy"', () => {
    expect(
      buildMatcherDef(matchers, matcherChars, 'dd.MM.yyyy').regex.source
    ).toBe(
      `${matchers.dd.source}${matchers['.'].source}${matchers.MM.source}${matchers['.'].source}${matchers.yyyy.source}`
    );
  });

  it('should correctly create regex for format "dd.MM.yy"', () => {
    expect(
      buildMatcherDef(matchers, matcherChars, 'dd.MM.yy').regex.source
    ).toBe(
      `${matchers.dd.source}${matchers['.'].source}${matchers.MM.source}${matchers['.'].source}${matchers.yy.source}`
    );
  });

  it('should correctly create regex for format "dd-MM-yyyy"', () => {
    expect(
      buildMatcherDef(matchers, matcherChars, 'dd-MM-yyyy').regex.source
    ).toBe(
      `${matchers.dd.source}${matchers['-'].source}${matchers.MM.source}${matchers['-'].source}${matchers.yyyy.source}`
    );
  });

  it('should correctly create regex for format "d-M-yyyy"', () => {
    expect(
      buildMatcherDef(matchers, matcherChars, 'd-M-yyyy').regex.source
    ).toBe(
      `${matchers.d.source}${matchers['-'].source}${matchers.M.source}${matchers['-'].source}${matchers.yyyy.source}`
    );
  });
});

describe('Date extractor polisher', () => {
  it('should correctly polish loosely matched strings', () => {
    const matcher = createMatcher(matchers, ['dd.MM.yyyy']);
    const match = matcher.exec('01.04, 2019');
    expect(match.isPresent()).toBeTruthy();
    expect(match.asIs()!.polishedMatch()).toBe('01.04.2019');
  });
});

describe('Matcher with sanity checks', () => {
  const sanityCheck = jest.fn().mockReturnValue(true);
  const matcher = createMatcher(
    {
      a: withSanityCheck(/(\d)/, sanityCheck),
      b: /([a-z])/i,
    },
    ['abab', 'b b b b']
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should match after sanity checks', () => {
    const res = matcher.exec('0001a2b000');
    expect(res.isPresent()).toBe(true);
    expect(res.asIs()!.regexMatch[0]).toBe('1a2b');
    expect(sanityCheck).toHaveBeenCalledTimes(2);
    expect(sanityCheck).toHaveBeenCalledWith('1');
    expect(sanityCheck).toHaveBeenCalledWith('2');
  });

  it("should don't run the sanity check if token doesn't match", () => {
    const res = matcher.exec('000a b c d00');
    expect(res.isPresent()).toBe(true);
    expect(res.asIs()!.regexMatch[0]).toBe('a b c d');
    expect(sanityCheck).not.toHaveBeenCalled();
  });
});
