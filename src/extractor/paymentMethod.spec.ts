import { PaymentMethodExtractor } from './paymentMethod';

describe('Payment method extractor', () => {
  const extractor = new PaymentMethodExtractor();

  it('should be successfully extract the payment method', () => {
    const text = `girocard`;
    const paymentMethod = extractor.extract(text, text.split('\n'), {});
    expect(paymentMethod).toBeDefined();
    if (paymentMethod) {
      expect(paymentMethod).toBe('DEBIT');
    }
  });
});
