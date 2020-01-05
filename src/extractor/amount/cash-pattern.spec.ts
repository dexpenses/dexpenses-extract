import { AmountValue } from './amount-value.model';
import { AmountValuePatternMatcher } from './amount-value-pattern';
import cashPattern from './cash-pattern';

function findAmountFromCashPaymentValues(values: AmountValue[]) {
  return new AmountValuePatternMatcher(cashPattern).match(values);
}

describe('amount/cash-pattern', () => {
  it('should find the right amount value', () => {
    expect(
      findAmountFromCashPaymentValues(
        [1.29, 0.89, 1.09, 0.99, 0.65, 4.91, 5.0, 0.09].map((value) => ({
          value,
        }))
      )
    ).toBe(4.91);

    expect(
      findAmountFromCashPaymentValues(
        [1.29, 0.89, 1.09, 0.99, 0.65, 4.91, 5.0, 0.09, 4.59].map((value) => ({
          value,
        }))
      )
    ).toBe(4.91);

    expect(
      findAmountFromCashPaymentValues(
        [1.29, 0.89, 1.09, 0.99, 0.65, 4.91, 5.0, 0.09, 4.59, 4.59].map(
          (value) => ({
            value,
          })
        )
      )
    ).toBe(4.91);

    expect(
      findAmountFromCashPaymentValues(
        [4.82, 5.02, 0.2].map((value) => ({ value }))
      )
    ).toBe(4.82);
  });
});
