import { DateTime } from 'luxon';
import model from './date.model.de';
import { DependsOn } from '../DependsOn';
import { Extractor } from './extractor';
import { cleanHeaders, HeaderExtractor } from './header';
import { Receipt } from '@dexpenses/core';
import matchers from './date-time-matchers';
import Matcher from '../utils/matcher';

@DependsOn(HeaderExtractor)
export class DateExtractor extends Extractor<Date> {
  private matcher: Matcher;

  constructor() {
    super('date');
    this.matcher = new Matcher(matchers, model);
  }

  public extract(text: string, lines: string[], extracted: Receipt) {
    const matches = this.matcher.match(text);
    if (!matches) {
      return null;
    }
    for (const match of matches) {
      const fullDate = match.result;

      cleanHeaders(extracted, fullDate);
      return DateTime.fromFormat(fullDate, match.format, {
        zone: 'Europe/Berlin',
      })
        .set({ hour: 0, minute: 0, second: 0 })
        .toJSDate();
    }
    return null;
  }
}
