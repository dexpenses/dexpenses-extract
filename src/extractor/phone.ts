import { DependsOn } from '../pipeline/DependsOn';
import { Extractor } from './extractor';
import { HeaderExtractor } from './header';
import { Receipt } from '@dexpenses/core';
import {
  createPhoneNumberPattern,
  parsePhoneNumber,
  phoneNumberPatternEquals,
} from './phone-utils';

export const phoneRegex = /(?:^|[.,: ])(\(?(?=\+49|\(?0)((\([\doOg \-\–\+\/]+\)|[\doOg \-\–\+\/])+){6,}\)?(?:([ \-–\/]?)([\doOg]+))+)/;
export const prefixRegex = /(?:[Tl](?:EL(?:EFON)?|el(?:efon)?)|Fon|(?:^|\s)el)\.?(?:\s?gratis\s?)?\s?:?/;
export const prefixedRegex = new RegExp(
  `${prefixRegex.source}${phoneRegex.source}`
);
const fixes = [
  { pattern: /o/gi, replaceWith: '0' },
  { pattern: /g/g, replaceWith: '9' },
];

const illegalPhoneNumberLinePrefixes = [/St\.?Nr\.?\s*$/i, /^UID\sNr\.?/i];

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
    return (
      this.extractFromHeader(extracted) ||
      this.extractFromWholeReceipt(lines, extracted)
    );
  }

  private extractFromHeader(extracted: Receipt) {
    for (const [, line] of extracted.header!.entries()) {
      const m = line.match(phoneRegex);
      if (m) {
        const prefix = line.substring(0, line.indexOf(m[0]));
        if (this.isIllegalPhoneNumberLine(prefix)) {
          continue;
        }
        let extractedNumber = m[1].trim();
        for (const fix of fixes) {
          extractedNumber = extractedNumber.replace(
            fix.pattern,
            fix.replaceWith
          );
        }
        if (this.isOwnNumber(extractedNumber)) {
          continue;
        }
        return extractedNumber;
      }
    }
    return null;
  }

  private extractFromWholeReceipt(lines: string[], extracted: Receipt) {
    for (const [, line] of lines.entries()) {
      const m = line.match(prefixedRegex);
      if (m) {
        let extractedNumber = m[1].trim();
        for (const fix of fixes) {
          extractedNumber = extractedNumber.replace(
            fix.pattern,
            fix.replaceWith
          );
        }
        if (this.isOwnNumber(extractedNumber)) {
          continue;
        }
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

  private isIllegalPhoneNumberLine(prefix: string) {
    return illegalPhoneNumberLinePrefixes.some((r) => prefix.match(r));
  }
}
