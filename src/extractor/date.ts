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
  statically,
} from './util/matcher';

export const matchers: Record<string, RegExpMatcher> = {
  d: /([1-9]|[12]\d|3[01])/,
  dd: /(0[1-9]|[12]\d|3[01])/,
  M: /([1-9]|1[0-2])/,
  MM: /(0[1-9]|1[0-2])/,
  yyyy: /([12]\d{3})/,
  yy: /([1-6][0-9])/,
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
