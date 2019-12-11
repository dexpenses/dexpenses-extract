import { DependsOn } from '../DependsOn';
import { Extractor } from './extractor';
import { HeaderExtractor } from './header';
import { Receipt, Time } from '@dexpenses/core';
import { DateTime } from 'luxon';
import { anyMatches } from './util';
import matchers from './date-time-matchers';
import Matcher from '../utils/matcher';

export const formats = [
  'h:mm:ss a',
  'HH:mm:ss',
  "HH:mm ss 'Uhr'",
  'dd.MM.yy HH:mm',
  'dd.MM.yy HH mm',
  '^HH mm:ss',
  'HH:mm',
  'h:mm',
  '^HH mm ss$',
];

const illegalPrefixPatterns = [/\s\d?\d:\d\d\s?-\s?$/];

const illegalSuffixPatterns = [/^\s?-\s?\d?\d:\d\d\s/];

const hasNoIllegalPrefix = (text: string) => (m: RegExpMatchArray) => {
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
    this.matcher = new Matcher(matchers, formats);
  }

  public extract(text: string, lines: string[], extracted: Receipt) {
    const matches = this.matcher.match(text);
    if (!matches) {
      return null;
    }
    for (const match of matches) {
      if (!hasNoIllegalPrefix(text)(match.match)) {
        continue;
      }
      const pt = DateTime.fromFormat(match.result, match.format, {
        zone: 'Europe/Berlin',
      });
      if (!pt.isValid) {
        throw new Error('invalid time parsing result should not happen');
      }
      return {
        hour: pt.hour,
        minute: pt.minute,
        second: match.format.includes('ss') ? pt.second : null,
      };
    }
    return null;
  }
}
