import { DateTime } from 'luxon';
import model from './date.model.de';
import { Extractor } from './extractor';
import { Receipt } from '@dexpenses/core';
import matchers from './date-time-matchers';
import Matcher from '../utils/matcher';
import { TextRange } from '../utils/text-range';

export type Meta = TextRange & {
  format: string;
};

export class DateExtractor extends Extractor<Date, Meta> {
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
      const date = DateTime.fromFormat(fullDate, match.format, {
        zone: 'Europe/Berlin',
      })
        .set({ hour: 0, minute: 0, second: 0 })
        .toJSDate();

      return {
        value: date,
        meta: {
          format: match.format,
          index: match.match.index!,
          length: match.match[0].length,
        },
      };
    }
    return null;
  }
}
