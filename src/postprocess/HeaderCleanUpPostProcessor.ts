import { Receipt } from '@dexpenses/core';
import PostProcessor from './PostProcessor';
import { HeaderExtractor } from '../extractor/header';

export default class HeaderCleanUpPostProcessor extends PostProcessor {
  public touch(extracted: Receipt) {
    if (!extracted.header) {
      return;
    }
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
