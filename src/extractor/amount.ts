import { Extractor } from './extractor';
import { Receipt, Amount } from '@dexpenses/core';
import { DependsOn } from '../pipeline/DependsOn';
import { PaymentMethodExtractor } from './paymentMethod';
import {
  getAllMatches,
  anyMatches as anyRegexMatches,
} from '../utils/regex-utils';
import { anyMatches } from './util';
import { desc, getMostFrequent, max } from '../utils/array';

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

  private _tryMatch(text: string, patterns: RegExp[]) {
    return anyMatches(text, patterns).then((m) => looselyParseFloat(m[1]));
  }

  private _extract(
    text: string,
    lines: string[],
    extracted: Receipt
  ): number | null {
    let amount = this._tryMatch(text, [
      /(?:gesamt|summe)(?:\s+EUR)?\s*(\d+,\d\d).*$/i,
      /betrag(?:\s+EUR)?\s*(\d+,\d\d).*$/i,
      /^geg(?:\.|eben)\sVISA$(?:\s+EUR)?\s*(\d+,\d\d).*$/im,
      /^(\d+,\d\d)$\n^Total in EUR$/im,
      /(\d+,\d\d)(?:$\n^eur)?$\n^zu zahlen/im,
      /^total:?(?:$\n)?^(?:€\s?)?(\d+[,\.]\s?\d\d)(?:\s?(?:€|EUR))?$/im,
    ]);
    if (amount != null) {
      return amount;
    }
    const amountValues = getAmountValues(lines);
    if (extracted.paymentMethod === 'CASH') {
      const amountValue = findAmountFromCashPaymentValues(amountValues);
      if (amountValue != null) {
        return amountValue;
      }
    }
    if (
      extracted.paymentMethod !== 'ONLINE' &&
      extracted.paymentMethod !== 'PAYPAL'
    ) {
      amount = this._tryMatch(text, [
        /zu zahlen:?\s?(?:EUR\s)?(\d+[,.]\d\d)(?: |$)?/im,
      ]);
      if (amount != null) {
        return amount;
      }
    }
    amount = this._tryMatch(text, [
      /(?:gesa[mn]t)?summe(?:\sEUR)?\s?(?:EC(?:[ -]Karte)?(?: EUR)?\s)?(\d+[.,]\d\d)$/im,
    ]);
    if (amount != null) {
      return amount;
    }
    if (amountValues.some((v) => v < 0)) {
      const mostFrequent = getMostFrequent(amountValues);
      if (
        mostFrequent &&
        mostFrequent.max > 1 &&
        mostFrequent.values.length === 1
      ) {
        return mostFrequent.values[0];
      }
    }
    const maxAmount = amountValues.reduce(max(), null);
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

const illegalPreviousLinePatterns = [/MwSt\.?\s?%?$/i, /Nachlass:?\s?$/i];

const illegalAmountPrefixPatterns = [
  /AS(-|\s)Zeit:?\s?$/i,
  /punktestand entspricht:?\s?$/i,
  /MwSt:?\s?$/i,
  /(Original|Einzel)preis:?\s?$/i,
  /PFAND\s?$/i,
  /Nachlass:?\s?$/i,
  /Netto:? ?$/i,
];

const illegalAmountSuffixPatterns = [/^\s?%/, /^\s?Uhr/i];

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
  const possibleAmounts: number[] = [];
  for (let i = values.length - 3; i >= 0; i -= 1) {
    const [amount, given, back] = values.slice(i, i + 3);
    if (equal(amount + (back < 0 ? -back : back), given)) {
      possibleAmounts.push(amount);
    }
  }
  if (possibleAmounts.length === 0) {
    return null;
  }
  possibleAmounts.sort(desc());
  return possibleAmounts[0];
}
