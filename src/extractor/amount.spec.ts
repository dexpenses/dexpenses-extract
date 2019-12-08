import {
  AmountExtractor,
  findAmountFromCashPaymentValues,
  getAmountValues,
} from './amount';

describe('Amount extractor', () => {
  const extractor = new AmountExtractor();

  it('should be successfully extract the amount', () => {
    const text = `Gesamt 11,10`;
    const result = extractor.extract(text, text.split['\n'], {});
    expect(result).toBeDefined();
    if (result) {
      expect(result.value).toBe(11.1);
    }
  });

  it('should be successfully extract the amount', () => {
    const text = `Betrag 11,10`;
    const result = extractor.extract(text, text.split('\n'), {});
    expect(result).toBeDefined();
    if (result) {
      expect(result.value).toBe(11.1);
    }
  });

  it('should be successfully extract the amount multiline', () => {
    const text = `betrag
    11,10`;
    const result = extractor.extract(text, text.split('\n'), {});
    expect(result).not.toBeNull();
    if (result) {
      expect(result.value).toBe(11.1);
    }
  });

  it('should be successfully extract the amount multiline', () => {
    const text = `gesamt
    11,10`;
    const result = extractor.extract(text, text.split('\n'), {});
    expect(result).toBeDefined();
    if (result) {
      expect(result.value).toBe(11.1);
    }
  });

  it('should be successfully extract the amount if lines contain only the decimals', () => {
    const text = `4,40
    5,90
    4,00
    4,10
    43,50
    0,00
    0,00
    61,90
    61,90`;
    const result = extractor.extract(
      text,
      text.split('\n').map((l) => l.trim()),
      {}
    );
    expect(result).toBeDefined();
    if (result) {
      expect(result.value).toBe(61.9);
    }
  });
});

describe('getAmountValues', () => {
  it('should find all amount-like values and transform them to numbers', () => {
    expect(getAmountValues(['3.50-', 'Kaufsumme:', '5,00', '1,50'])).toEqual([
      3.5,
      5,
      1.5,
    ]);

    expect(getAmountValues(['4, 82', '5, 02', '-0,20'])).toEqual([
      4.82,
      5.02,
      -0.2,
    ]);

    expect(
      getAmountValues([
        'u zah len EUR: 4.4S',
        'Bar',
        'Rückgeld',
        '50,00',
        '45,55',
      ])
    ).toEqual([4.45, 50, 45.55]);
  });
});

describe('findAmountFromCashPaymentValues', () => {
  it('should find the right amount value', () => {
    expect(
      findAmountFromCashPaymentValues([
        1.29,
        0.89,
        1.09,
        0.99,
        0.65,
        4.91,
        5.0,
        0.09,
      ])
    ).toBe(4.91);

    expect(
      findAmountFromCashPaymentValues([
        1.29,
        0.89,
        1.09,
        0.99,
        0.65,
        4.91,
        5.0,
        0.09,
        4.59,
      ])
    ).toBe(4.91);

    expect(
      findAmountFromCashPaymentValues([
        1.29,
        0.89,
        1.09,
        0.99,
        0.65,
        4.91,
        5.0,
        0.09,
        4.59,
        4.59,
      ])
    ).toBe(4.91);

    expect(findAmountFromCashPaymentValues([4.82, 5.02, 0.2])).toBe(4.82);
  });
});
