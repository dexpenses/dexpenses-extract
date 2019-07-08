import { DependsOn } from '../DependsOn';
import { Extractor } from './extractor';
import { HeaderExtractor, cleanHeaders } from './header';
import { Receipt } from '@dexpenses/core';
import {
  createPhoneNumberPattern,
  parsePhoneNumber,
  phoneNumberPatternEquals,
} from './phone-utils';

const phoneRegex = /(?:^|[.,:\s])(\(?(?=\+49|\(?0)((\([\d \-\–\+\/]+\)|[\d \-\–\+\/])+){6,}\)?([ \-–\/]?)([\doO]+))/;
const prefixRegex = /(?:Tel(?:efon)?|Fon|(?:^|\s)el)\.?:?/i;
const prefixedRegex = new RegExp(
  `${prefixRegex.source}${phoneRegex.source}`,
  'i'
);

@DependsOn(HeaderExtractor)
export class PhoneNumberExtractor extends Extractor<string> {
  private readonly ownNumber?: RegExp;
  constructor(ownNumber?: string) {
    super('phone');
    if (ownNumber) {
      this.ownNumber = createPhoneNumberPattern(parsePhoneNumber(ownNumber));
    }
  }

  public extract(text: string, lines: string[], extracted: Receipt) {
    for (const [i, line] of extracted.header!.entries()) {
      const m = line.match(phoneRegex);
      if (m) {
        const prefix = line.substring(0, line.indexOf(m[0]));
        if (prefix.match(/St\.?Nr\.?\s*$/i) || prefix.match(/^UID\sNr\.?/i)) {
          continue;
        }
        const extractedNumber = m[1].trim().replace(/o/gi, '0');
        if (this.isOwnNumber(extractedNumber)) {
          continue;
        }
        cleanHeaders(extracted, prefixedRegex, i > 0);
        cleanHeaders(extracted, phoneRegex, i > 0);
        return extractedNumber;
      }
    }
    for (const [i, line] of lines.entries()) {
      const m = line.match(prefixedRegex);
      if (m) {
        const extractedNumber = m[1].trim().replace(/o/gi, '0');
        if (this.isOwnNumber(extractedNumber)) {
          continue;
        }
        cleanHeaders(extracted, m[0], i > 0);
        return extractedNumber;
      }
    }
    return null;
  }

  private isOwnNumber(phoneNumber: string) {
    return (
      this.ownNumber && phoneNumberPatternEquals(this.ownNumber, phoneNumber)
    );
  }
}
