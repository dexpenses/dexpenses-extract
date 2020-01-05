import { AmountValue } from './amount-value.model';
import { desc, range } from '../../utils/array';
import PreConditionedStage from '../../utils/first-hit-pipeline/PreConditionedStage';
import AmountExtractionInput from './AmountExtractionInput';

export interface AmountValuePattern {
  startAt: 'beginning' | 'end';
  count: number;
  match(data: {
    amountValues: AmountValue[];
    values: number[];
    allAmountValues: AmountValue[];
    allValues: number[];
  }): AmountValue[] | null;
  getResult(possibleResults: AmountValue[][]): number | null;
}

export function maxAmount(possibleResults: AmountValue[][]): number {
  const amounts = possibleResults.map(([{ value }]) => value);
  amounts.sort(desc());
  return amounts[0];
}

export class AmountValuePatternMatcher {
  constructor(private def: AmountValuePattern) {}

  match(values: AmountValue[]) {
    const tuples = range(values.length - this.def.count + 1).map((i) =>
      values.slice(i, i + this.def.count)
    );
    if (this.def.startAt === 'end') {
      tuples.reverse();
    }
    const data = {
      allAmountValues: values,
      allValues: values.map(({ value }) => value),
    };
    const possibleResults = tuples
      .map((amountValues) =>
        this.def.match({
          ...data,
          amountValues,
          values: amountValues.map(({ value }) => value),
        })
      )
      .filter(((r) => r != null) as (r) => r is AmountValue[]);
    if (possibleResults.length === 0) {
      return null;
    }
    return this.def.getResult(possibleResults);
  }
}

// tslint:disable-next-line: max-classes-per-file
export class AmountValuePatternStage extends PreConditionedStage<
  AmountExtractionInput,
  number
> {
  private matcher: AmountValuePatternMatcher;
  constructor(
    pattern: AmountValuePattern,
    condition?: (input: AmountExtractionInput) => boolean
  ) {
    super(condition);
    this.matcher = new AmountValuePatternMatcher(pattern);
  }

  public doProcess({ amountValues }) {
    return this.matcher.match(amountValues);
  }
}
