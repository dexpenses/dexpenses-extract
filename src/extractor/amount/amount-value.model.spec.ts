import { Model } from './amount-value.model';

describe('amount-value.model', () => {
  it('should throw error if amountValuePattern has no capture group', () => {
    expect(() =>
      Model.parseAndValidate({
        amountValuePattern: /\d+/g,
      })
    ).toThrowErrorMatchingSnapshot();
  });
  it('should throw error if amountValuePattern has multiple capture group', () => {
    expect(() =>
      Model.parseAndValidate({
        amountValuePattern: /(\d+),(\d)/g,
      })
    ).toThrowErrorMatchingSnapshot();
  });

  it('should throw error if amountValuePattern does not have the global flag', () => {
    expect(() =>
      Model.parseAndValidate({
        amountValuePattern: /(\d+)/,
      })
    ).toThrowErrorMatchingSnapshot();
  });

  it('should succeed if amountValuePattern has a single capture group and the global flag', () => {
    expect(() =>
      Model.parseAndValidate({
        amountValuePattern: /(\d+)/g,
      })
    ).not.toThrowError();
  });

  it('should throw error if empty original string occurs in replacements', () => {
    expect(() => {
      Model.parseAndValidate({
        amountValuePattern: /(\d+)/g,
        replacements: [['', 'this does not work']],
      });
    }).toThrowErrorMatchingSnapshot();
  });

  it('should wrap replacement string as RegExp with global flag', () => {
    const [[original, replacement]] = Model.parseAndValidate({
      amountValuePattern: /(\d+)/g,
      replacements: [['S', '5']],
    }).replacements;
    expect(original).toBeInstanceOf(RegExp);
    expect(original.source).toBe('S');
    expect(original.flags).toBe('g');
    expect(replacement).toBe('5');
  });

  it('should not throw if illegalAmountPrefixPattern is undefined and default to an empty array', () => {
    expect(() =>
      Model.parseAndValidate({ amountValuePattern: /(\d+)/g })
    ).not.toThrowError();
    expect(
      Model.parseAndValidate({ amountValuePattern: /(\d+)/g })
        .illegalAmountPrefixPatterns
    ).toEqual([]);
  });

  it('should throw error if illegalAmountPrefixPattern does not end in $', () => {
    expect(() => {
      Model.parseAndValidate({
        amountValuePattern: /(\d+)/g,
        illegalAmountPrefixPatterns: [/ha\$ha ?/],
      });
    }).toThrowErrorMatchingSnapshot();
  });

  it('should throw error if illegalAmountPrefixPattern ends with literal "\\$"', () => {
    expect(() => {
      Model.parseAndValidate({
        amountValuePattern: /(\d+)/g,
        illegalAmountPrefixPatterns: [/ha\$/],
      });
    }).toThrowErrorMatchingSnapshot();
  });

  it('should succeed if illegalAmountPrefixPattern ends with a $ and wrap RegExp', () => {
    const [illegalAmountPrefixPattern] = Model.parseAndValidate({
      amountValuePattern: /(\d+)/g,
      illegalAmountPrefixPatterns: [/ha$/],
    }).illegalAmountPrefixPatterns;
    expect(illegalAmountPrefixPattern).toEqual({
      pattern: /ha$/,
      taxRelated: false,
    });
  });

  it('should throw error if illegalAmountSuffixPattern does not start with ^', () => {
    expect(() => {
      Model.parseAndValidate({
        amountValuePattern: /(\d+)/g,
        illegalAmountSuffixPatterns: [/ha\^ha ?/],
      });
    }).toThrowErrorMatchingSnapshot();
  });

  it('should throw error if illegalAmountSuffixPattern starts with literal ^', () => {
    expect(() => {
      Model.parseAndValidate({
        amountValuePattern: /(\d+)/g,
        illegalAmountSuffixPatterns: [/\^ha ?/],
      });
    }).toThrowErrorMatchingSnapshot();
  });

  it('should succeed if illegalAmountSuffixPattern starts with a ^ and wrap RegExp', () => {
    const [illegalAmountSuffixPattern] = Model.parseAndValidate({
      amountValuePattern: /(\d+)/g,
      illegalAmountSuffixPatterns: [/^ha/],
    }).illegalAmountSuffixPatterns;
    expect(illegalAmountSuffixPattern).toEqual({
      pattern: /^ha/,
      taxRelated: false,
    });
  });
});
