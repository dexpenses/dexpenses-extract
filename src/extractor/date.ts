import { DateTime } from 'luxon';
import model from './date.model.de';
import { DependsOn } from '../DependsOn';
import { Extractor } from './extractor';
import { cleanHeaders, HeaderExtractor } from './header';
import { Receipt } from '@dexpenses/core';
import {
  createMatcher,
  Matcher,
  RegExpMatcher,
  withSanityCheck,
  statically,
} from '../utils/matcher';

function currentYear() {
  return new Date().getFullYear();
}

export const matchers: Record<string, RegExpMatcher> = {
  d: /([1-9]|[12]\d|3[01])/,
  dd: /(0[1-9]|[12]\d|3[01])/,
  M: /([1-9]|1[0-2])/,
  MM: /(0[1-9]|1[0-2])/,
  MMM: /(jan|feb|märz|apr|mai|jun|jul|aug|sep|okt|nov|dez)/i,
  yyyy: withSanityCheck(
    /((?:19|2\d)\d{2})/,
    (m) => parseInt(m, 10) <= currentYear()
  ),
  yy: withSanityCheck(
    /([1-6][0-9])/,
    (m) =>
      DateTime.fromFormat(m, 'yy', {
        zone: 'Europe/Berlin',
      }).year <= currentYear()
  ),
  HH: /([01]\d|2[0-4])/,
  mm: /([0-5]\d)/,
  ss: /([0-5]\d)/,
  '.': statically(/\s?[\.,]\s?/),
  '-': statically(/\s?\-\s?/),
};

@DependsOn(HeaderExtractor)
export class DateExtractor extends Extractor<Date> {
  private matcher: Matcher;

  constructor() {
    super('date');
    this.matcher = createMatcher(matchers, model);
    //console.log(this.matcher);
  }

  public extract(text: string, lines: string[], extracted: Receipt) {
    return this.matcher.exec(text).then((res) => {
      const fullDate = res.polishedMatch();

      cleanHeaders(extracted, fullDate);
      return DateTime.fromFormat(fullDate, res.def.format, {
        zone: 'Europe/Berlin',
      })
        .set({ hour: 0, minute: 0, second: 0 })
        .toJSDate();
    });
  }
}
