import { Extractor } from './extractor';
import { Receipt, Amount } from '@dexpenses/core';
import { DependsOn } from '../DependsOn';
import { PaymentMethodExtractor } from './paymentMethod';
import {
  getAllMatches,
  anyMatches as anyRegexMatches,
} from '../utils/regex-utils';
import { anyMatches } from './util';

@DependsOn(PaymentMethodExtractor)
export class AmountExtractor extends Extractor<Amount> {
  constructor() {
    super('amount');
  }

  public extract(
    text: string,
    lines: string[],
    extracted: Receipt
  ): Amount | null {
    const result = this._extract(text, lines, extracted);
    if (result == null) {
      return result;
    }
    return {
      value: result,
      currency: 'EUR',
    };
  }

  private _extract(
    text: string,
    lines: string[],
    extracted: Receipt
  ): number | null {
    const amount = anyMatches(text, [
      /(?:gesamt|summe)(?:\s+EUR)?\s*(\d+,\d\d).*$/i,
      /betrag(?:\s+EUR)?\s*(\d+,\d\d).*$/i,
      // /^geg(?:\.|eben)(?:\sVISA)?$(?:\s+EUR)?\s*(\d+,\d\d).*$/im,
      /^geg(?:\.|eben)\sVISA$(?:\s+EUR)?\s*(\d+,\d\d).*$/im,
      /^(\d+,\d\d)$\n^Total in EUR$/im,
      /(\d+,\d\d)(?:$\n^eur)?$\n^zu zahlen/im,
      // /total:?(?:$\n)?^(\d+,\d\d)$/im,
      /^total:?(?:$\n)?^(?:€\s?)?(\d+[,\.]\s?\d\d)(?:\s?(?:€|EUR))?$/im,
    ]).then((m) => looselyParseFloat(m[1]));
    if (amount != null) {
      return amount;
    }
    const amountValues = getAmountValues(lines);
    if (amountValues.length === 0) {
      return null;
    }
    if (extracted.paymentMethod === 'CASH') {
      const amountValue = findAmountFromCashPaymentValues(amountValues);
      if (amountValue != null) {
        return amountValue;
      }
    }
    if (amountValues.some((v) => v < 0)) {
      const [mostFrequent, mostFrequent2] = Object.entries(
        amountValues.reduce((acc, cur) => {
          acc[cur] = (acc[cur] || 0) + 1;
          return acc;
        }, {} as Record<number, number>)
      ).sort(([, f1], [, f2]) => f2 - f1);
      if (!mostFrequent2 || mostFrequent[1] !== mostFrequent2[1]) {
        return Number(mostFrequent[0]);
      }
    }
    const maxAmount = amountValues.reduce((max: number | null, cur) => {
      return !max || cur > max ? cur : max;
    }, null);
    if (maxAmount != null) {
      return maxAmount;
    }

    return null;
  }
}

/*
 1. line start or space
 2. optionally negative number (, and . match as decimal point with optional space after decimal point)
 with no leading zero where S also matches as 5
 3. line end, space or dash
 */
const amountValuePattern = /(?:^|\s|\*)(-?(?:[1-9]\d+|\d)\s?[,.]\s?[\dS]{2})(?:[\-\s€]|$)/gim;

const illegalPreviousLinePatterns = [/MwSt\.?\s?%?$/i];

const illegalAmountPrefixPatterns = [
  /AS(-|\s)Zeit:?\s?$/i,
  /punktestand entspricht:?\s?$/i,
  /MwSt:?\s?$/i,
  /Originalpreis\s?$/i,
  /PFAND\s?$/i,
];

const illegalAmountSuffixPatterns = [/^\s?%/, /^\s?Uhr/i];

// TODO: we could include date filter (i.e. not take dd.MM from the matched date as amount value)
export function getAmountValues(lines: string[]): number[] {
  return lines
    .flatMap((line, lineIndex) =>
      getAllMatches(amountValuePattern, line).map((match) => ({
        match,
        lineIndex,
      }))
    )
    .filter(
      ({ match, lineIndex }) =>
        (lineIndex === 0 ||
          !anyRegexMatches(
            lines[lineIndex - 1],
            illegalPreviousLinePatterns
          )) &&
        !anyRegexMatches(
          match.input.slice(0, match.index),
          illegalAmountPrefixPatterns
        ) &&
        !anyRegexMatches(
          match.input.slice(match.index + match[0].length),
          illegalAmountSuffixPatterns
        )
    )
    .map(({ match: [_, amount] }) => looselyParseFloat(amount));
}

function looselyParseFloat(s: string): number {
  return parseFloat(
    s
      .replace(/\s/g, '')
      .replace(/S/g, '5')
      .replace(',', '.')
  );
}

function equal(x: number, y: number) {
  return Number(Math.abs(x - y).toFixed(2)) < Number.EPSILON;
}

export function findAmountFromCashPaymentValues(values: number[]) {
  for (let i = values.length - 3; i >= 0; i -= 1) {
    const [amount, given, back] = values.slice(i, i + 3);
    if (equal(amount + (back < 0 ? -back : back), given)) {
      return amount;
    }
  }
  return null;
}
