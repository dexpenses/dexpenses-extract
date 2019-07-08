import {
  phoneNumberEquals,
  parsePhoneNumber,
  createPhoneNumberPattern,
} from './phone-utils';

describe('phone-utils/phoneNumberEquals', () => {
  const pn = {
    country: '49',
    number: '1234567890',
  };

  it.each([
    ['+491234567890'],
    ['01234567890'],
    ['00491234567890'],
    ['0123 4567890'],
    ['0123 456 789 0'],
    ['(0123) 4567890'],
    ['0123/4567890'],
    ['0123/456 789 0'],
    ['0123-4567890'],
  ])('should match %s', (number) => {
    expect(phoneNumberEquals(pn, number)).toBe(true);
  });
});

describe('phone-utils/parsePhoneNumber', () => {
  it('should parse +49123456', () => {
    expect(parsePhoneNumber('+49123456')).toEqual({
      country: '49',
      number: '123456',
    });
  });

  it('should parse 0049123456', () => {
    expect(parsePhoneNumber('0049123456')).toEqual({
      country: '49',
      number: '123456',
    });
  });

  it('should parse 0123456', () => {
    expect(parsePhoneNumber('0123456')).toEqual({
      number: '123456',
    });
  });
});

describe('phone-utils/createPhoneNumberPattern', () => {
  it('should create unlocalized pattern', () => {
    const pattern = createPhoneNumberPattern({ number: '123456' });
    expect(pattern.source).toBe(/^(\+\d\d|00\d\d|0)123456$/.source);
  });

  it('should create localized pattern', () => {
    const pattern = createPhoneNumberPattern({
      country: '49',
      number: '123456',
    });
    expect(pattern.source).toBe(/^(\+49|0049|0)123456$/.source);
  });
});
