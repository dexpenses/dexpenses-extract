import { AmountValuePattern, maxAmount } from './amount-value-pattern';
import { equal, floor, round } from './utils';

export default function(vatRate: number): AmountValuePattern {
  return {
    startAt: 'end',
    count: 2,
    match({ amountValues, values: [v1, v2], allValues }) {
      if (v1 === 0 || v2 === 0) {
        return null;
      }
      if (
        allValues.includes(v1 + v2) &&
        (equal(floor(v1 * 0.19), v2) || equal(floor(v2 * 0.19), v1))
      ) {
        return amountValues;
      }
      return null;
    },
    getResult: maxAmount,
  };
}
