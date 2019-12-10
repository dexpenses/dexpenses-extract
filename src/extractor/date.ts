import { DateTime } from 'luxon';
import model from './date.model.de';
import { DependsOn } from '../DependsOn';
import { Extractor } from './extractor';
import { cleanHeaders, HeaderExtractor } from './header';
import { Receipt } from '@dexpenses/core';
import { createMatcher, Matcher } from '../utils/matcher';
import matchers from './date-time-matchers';

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
