import { DependsOn } from '../DependsOn';
import { Extractor } from './extractor';
import { cleanHeaders, HeaderExtractor } from './header';
import { Receipt, Time } from '@dexpenses/core';
import { statically, createMatcher, Matcher } from '../utils/matcher';
import { DateTime } from 'luxon';

export const matchers = {
  h: /((?:[1i][0-2i]|[1-9]))/i,
  HH: /((?:[01i][0-9i]|2[0-4i]))/i,
  mm: /([0-5i][0-9i])/,
  ss: /([0-5i][0-9i])/,
  ':': statically(/\s?[:;]\s?/),
  a: /([AP]M)/i,
  // '^': /(?:^|\s)/,
  '§': statically(/(?:^|\s)/),
};

export const formats = [
  'h:mm:ss a',
  'HH:mm:ss',
  '^HH mm:ss',
  'HH:mm',
  'h:mm',
  '§HH mm ss',
];

@DependsOn(HeaderExtractor)
export class TimeExtractor extends Extractor<Time> {
  private readonly matcher: Matcher;
  constructor() {
    super('time');
    this.matcher = createMatcher(matchers, formats);
  }

  public extract(text: string, lines: string[], extracted: Receipt) {
    return this.matcher.exec(text).then((res) => {
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
