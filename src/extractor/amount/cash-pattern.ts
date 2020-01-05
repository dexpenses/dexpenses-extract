import { AmountValuePattern, maxAmount } from './amount-value-pattern';
import { equal } from './utils';

export default {
  startAt: 'end',
  count: 3,
  match({ values: [amount, given, back], amountValues }) {
    if (amountValues.some((v) => v.taxRelated)) {
      return null;
    }
    if (equal(amount + (back < 0 ? -back : back), given)) {
      return amountValues;
    }
    return null;
  },
  getResult: maxAmount,
} as AmountValuePattern;
