import {
  tokenize,
  getTokenChars,
  buildMatcherDef,
  createMatcher,
} from './matcher';
import { matchers } from '../date';

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
      `${matchers.dd.source}${matchers['.'].source}${matchers.MM.source}${
        matchers['.'].source
      }${matchers.yyyy.source}`
    );
  });

  it('should correctly create regex for format "dd.MM.yy"', () => {
    expect(
      buildMatcherDef(matchers, matcherChars, 'dd.MM.yy').regex.source
    ).toBe(
      `${matchers.dd.source}${matchers['.'].source}${matchers.MM.source}${
        matchers['.'].source
      }${matchers.yy.source}`
    );
  });

  it('should correctly create regex for format "dd-MM-yyyy"', () => {
    expect(
      buildMatcherDef(matchers, matcherChars, 'dd-MM-yyyy').regex.source
    ).toBe(
      `${matchers.dd.source}${matchers['-'].source}${matchers.MM.source}${
        matchers['-'].source
      }${matchers.yyyy.source}`
    );
  });

  it('should correctly create regex for format "d-M-yyyy"', () => {
    expect(
      buildMatcherDef(matchers, matcherChars, 'd-M-yyyy').regex.source
    ).toBe(
      `${matchers.d.source}${matchers['-'].source}${matchers.M.source}${
        matchers['-'].source
      }${matchers.yyyy.source}`
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
