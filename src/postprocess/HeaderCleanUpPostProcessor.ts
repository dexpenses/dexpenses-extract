import { Receipt } from '@dexpenses/core';
import PostProcessor from './PostProcessor';
import { HeaderExtractor, cleanHeaders } from '../extractor/header';
import matchers from '../extractor/date-time-matchers';
import { formats as timeFormats } from '../extractor/time';
import dateModel from '../extractor/date.model.de';
import Matcher from '../utils/matcher';

export default class HeaderCleanUpPostProcessor extends PostProcessor {
  private dateMatcher: Matcher;
  private timeMatcher: Matcher;

  constructor() {
    super();
    this.dateMatcher = new Matcher(matchers, dateModel);
    this.timeMatcher = new Matcher(matchers, timeFormats);
  }

  public touch(extracted: Receipt) {
    if (!extracted.header) {
      return;
    }
    /*
     * Clean date and time pattern from the header and slice after a match in row 2 and onwards
     */
    this.dateMatcher.formats.forEach((def) =>
      cleanHeaders(extracted, def.regex, (index) => index > 1)
    );
    this.timeMatcher.formats.forEach((def) => {
      cleanHeaders(
        extracted,
        new RegExp(def.regex.source + /\s?Uhr/.source, def.regex.flags),
        (index) => index > 1
      );
      cleanHeaders(extracted, def.regex, (index) => index > 1);
    });
    cleanHeaders(extracted, /^Uhr$/);

    const i = extracted.header.findIndex(containsMostlyNumbers);
    if (i !== -1) {
      extracted.header.splice(i);
    }
    extracted.header = extracted.header.map((line) =>
      line.replace(/([a-zA-Z])(Nr\.\s?\d+)/g, '$1 $2')
    );

    /*
    run irrelevant header line filter once again
    since header lines could have changed (been cleaned) by other extractors
     */
    extracted.header = extracted.header.filter(
      (line, index) => !HeaderExtractor.isIrrelevantLine(line, index)
    );
  }
}

export function containsMostlyNumbers(line: string) {
  line = line.replace(/\s/g, '');
  const digits = [...line].filter((c) => !isNaN(+c)).length;
  return digits >= 6 && digits / line.length > 0.6;
}
