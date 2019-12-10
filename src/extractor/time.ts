import { DependsOn } from '../DependsOn';
import { Extractor } from './extractor';
import { cleanHeaders, HeaderExtractor } from './header';
import { Receipt, Time } from '@dexpenses/core';
import { createMatcher, Matcher, MatcherDef } from '../utils/matcher';
import { DateTime } from 'luxon';
import { anyMatches } from './util';
import matchers from './date-time-matchers';

export const formats = [
  'h:mm:ss a',
  'HH:mm:ss',
  '^HH mm:ss',
  'HH:mm',
  'h:mm',
  '§HH mm ss',
  'dd.MM.yy HH mm',
];

const illegalPrefixPatterns = [/\s\d?\d:\d\d\s?-\s?$/];

const illegalSuffixPatterns = [/^\s?-\s?\d?\d:\d\d\s/];

const hasNoIllegalPrefix = (text: string) => (
  m: RegExpMatchArray,
  def: MatcherDef
) => {
  const prefix = text.slice(0, m.index);
  const suffix = text.slice(m.index! + m[0].length);
  return (
    !anyMatches(prefix, illegalPrefixPatterns).isPresent() &&
    !anyMatches(suffix, illegalSuffixPatterns).isPresent()
  );
};

@DependsOn(HeaderExtractor)
export class TimeExtractor extends Extractor<Time> {
  private readonly matcher: Matcher;
  constructor() {
    super('time');
    this.matcher = createMatcher(matchers, formats);
  }

  public extract(text: string, lines: string[], extracted: Receipt) {
    return this.matcher.exec(text, hasNoIllegalPrefix(text)).then((res) => {
      const [fullTime, , , second] = res.regexMatch;
      const pt = DateTime.fromFormat(
        res.polishedMatch().replace(/i/g, '1'),
        res.def.format,
        {
          zone: 'Europe/Berlin',
        }
      );
      if (!pt.isValid) {
        throw new Error(
          'Time parsing failed! Regexes should only match valid times! Maybe polishing loose matches is incomplete'
        );
      }
      cleanHeaders(extracted, new RegExp(`${fullTime} Uhr`));
      cleanHeaders(extracted, fullTime);
      return {
        hour: pt.hour,
        minute: pt.minute,
        second: second ? pt.second : null,
      };
    });
  }
}
