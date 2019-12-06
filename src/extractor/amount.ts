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
    const amount = anyMatches(text, [
      /(?:gesamt|summe)(?:\s+EUR)?\s*(\d+,\d\d).*$/i,
      /betrag(?:\s+EUR)?\s*(\d+,\d\d).*$/i,
      // /^geg(?:\.|eben)(?:\sVISA)?$(?:\s+EUR)?\s*(\d+,\d\d).*$/im,
      /^geg(?:\.|eben)\sVISA$(?:\s+EUR)?\s*(\d+,\d\d).*$/im,
      /^(\d+,\d\d)$\n^Total in EUR$/im,
      /(\d+,\d\d)(?:$\n^eur)?$\n^zu zahlen/im,
      /total:?(?:$\n)?^(\d+,\d\d)$/im,
    ]).then(
      (m) =>
        ({
          value: parseFloat(m[1].replace(',', '.')),
          currency: 'EUR',
        } as Amount)
    );
    if (amount) {
      return amount;
    }
    if (extracted.paymentMethod === 'CASH') {
      const amountValue = findAmountFromCashPaymentValues(
        getAmountValues(lines)
      );
      if (amountValue) {
        return {
          value: amountValue,
          currency: 'EUR',
        };
      }
    }
    const maxAmount = getAmountValues(lines).reduce(
      (max: number | null, cur) => {
        return !max || cur > max ? cur : max;
      },
      null
    );
    if (maxAmount) {
      return {
        value: maxAmount,
        currency: 'EUR',
      };
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
const amountValuePattern = /(?:^|\s|\*)-?((?:[1-9]\d+|\d)\s?[,.]\s?[\dS]{2})(?:[\-\s€]|$)/gim;

const illegalPreviousLinePatterns = [/MwSt\.?\s?%?$/i];

const illegalAmountPrefixPatterns = [
  /AS-Zeit:?\s?$/i,
  /punktestand entspricht:?\s?$/i,
  /MwSt:?\s?$/i,
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
