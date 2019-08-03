import { Receipt } from '@dexpenses/core';
import PostProcessor from './PostProcessor';
import { HeaderExtractor, cleanHeaders } from '../extractor/header';
import { Matcher, createMatcher } from '../utils/matcher';
import { matchers as dateMatchers } from '../extractor/date';
import {
  matchers as timeMatchers,
  formats as timeFormats,
} from '../extractor/time';
import dateModel from '../extractor/date.model.de';

export default class HeaderCleanUpPostProcessor extends PostProcessor {
  private dateMatcher: Matcher;
  private timeMatcher: Matcher;

  constructor() {
    super();
    this.dateMatcher = createMatcher(dateMatchers, dateModel);
    this.timeMatcher = createMatcher(timeMatchers, timeFormats);
  }

  public touch(extracted: Receipt) {
    if (!extracted.header) {
      return;
    }
    /*
     * Clean date and time pattern from the header and slice after a match in row 2 and onwards
     */
    this.dateMatcher.matchers.forEach((def) =>
      cleanHeaders(extracted, def.regex, (index) => index > 1)
    );
    this.timeMatcher.matchers.forEach((def) =>
      cleanHeaders(extracted, def.regex, (index) => index > 1)
    );

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
