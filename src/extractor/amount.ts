import { Extractor } from './extractor';
import { Receipt, Amount } from '@dexpenses/core';
import { DependsOn } from '../pipeline/DependsOn';
import { PaymentMethodExtractor } from './paymentMethod';
import { anyMatches as anyRegexMatches } from '../utils/regex-utils';
import { desc, getMostFrequent, max } from '../utils/array';
import FirstHitPipeline from '../utils/first-hit-pipeline';
import AmountExtractionInput from './amount/AmountExtractionInput';
import RegexMatchStage from './amount/RegexMatchStage';
import { fn, processIf } from '../utils/first-hit-pipeline/Stage';
import { equal, floor } from './amount/utils';
import { DateExtractor } from './date';
import { AmountValuesExtractor } from './amount/amount-values';
import { AmountValuePatternStage } from './amount/amount-value-pattern';
import cashPattern from './amount/cash-pattern';

const amountValuesExtractor = new AmountValuesExtractor();

const pipeline = new FirstHitPipeline<AmountExtractionInput, number>([
  new RegexMatchStage(
    [
      /(?:gesamt|summe)(?:\s+EUR)?\s*(\d+,\d\d).*$/i,
      /betrag(?:\s+EUR)?\s*(\d+,\d\d).*$/i,
      /^geg(?:\.|eben)\sVISA$(?:\s+EUR)?\s*(\d+,\d\d).*$/im,
      /^(\d+,\d\d)$\n^Total in EUR$/im,
      /(\d+,\d\d)(?:$\n^eur)?$\n^zu zahlen/im,
      /^total:?(?:$\n)?^(?:€\s?)?(\d+[,\.]\s?\d\d)(?:\s?(?:€|EUR))?$/im,
    ],
    (m) => amountValuesExtractor.parse(m[1])
  ),
  new AmountValuePatternStage(
    cashPattern,
    ({ paymentMethod }) => paymentMethod === 'CASH'
  ),
  new RegexMatchStage(
    [/zu zahlen:?\s?(?:EUR\s)?(\d+[,.]\d\d)(?: |$)?/im],
    (m) => amountValuesExtractor.parse(m[1]),
    ({ paymentMethod }) =>
      paymentMethod !== 'ONLINE' && paymentMethod !== 'PAYPAL'
  ),
  new RegexMatchStage(
    [
      /(?:gesa[mn]t)?summe(?:\sEUR)?\s?(?:EC(?:[ -]Karte)?(?: EUR)?\s)?(\d+[.,]\d\d)$/im,
    ],
    (m) => amountValuesExtractor.parse(m[1])
  ),
  processIf(
    ({ taxUnrelatedAmountValues }) =>
      taxUnrelatedAmountValues.some((v) => v < 0),
    ({ taxUnrelatedAmountValues }) => {
      const mostFrequent = getMostFrequent(taxUnrelatedAmountValues);
      if (
        mostFrequent &&
        mostFrequent.max > 1 &&
        mostFrequent.values.length === 1
      ) {
        return mostFrequent.values[0];
      }
      return null;
    }
  ),
  processIf(
    ({ text }) => !anyRegexMatches(text, [/(^| )7([,.] ?0 ?0?)? ?%( |$)/m]),
    ({ taxUnrelatedAmountValues }) => findVATPattern(taxUnrelatedAmountValues)
  ),
  fn(({ taxUnrelatedAmountValues }) =>
    taxUnrelatedAmountValues.reduce(max(), null)
  ),
]);

@DependsOn(PaymentMethodExtractor, DateExtractor)
export class AmountExtractor extends Extractor<Amount> {
  constructor() {
    super('amount');
  }

  public extract(
    text: string,
    lines: string[],
    extracted: Receipt,
    meta?: Record<string, any>
  ) {
    const amountValues = amountValuesExtractor
      .extract(text, meta?.date)
      .filter(({ taxRelated }) => !taxRelated); // TODO WIP
    const result = pipeline.run({
      text,
      lines,
      paymentMethod: extracted.paymentMethod,
      amountValues,
      taxUnrelatedAmountValues: amountValues.map(({ value }) => value),
    });
    if (result == null) {
      return null;
    }
    return {
      value: {
        value: result,
        currency: 'EUR',
      },
    };
  }
}

export function findVATPattern(values: number[]): number | null {
  const possibleAmounts: number[] = [];
  for (let i = values.length - 2; i >= 0; i -= 1) {
    const [v1, v2] = values.slice(i, i + 2);
    if (v1 === 0 || v2 === 0) {
      continue;
    }
    if (
      values.includes(v1 + v2) &&
      (equal(floor(v1 * 0.19), v2) || equal(floor(v2 * 0.19), v1))
    ) {
      possibleAmounts.push(v1 + v2);
    }
  }
  if (possibleAmounts.length === 0) {
    return null;
  }
  possibleAmounts.sort(desc());
  return possibleAmounts[0];
}
