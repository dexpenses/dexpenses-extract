export interface PhoneNumber {
  country?: string;
  number: string;
}

export function parsePhoneNumber(fullNumber: string): PhoneNumber {
  let m = fullNumber.match(/^\+(\d\d)(.*)$/);
  if (!m) {
    m = fullNumber.match(/^00(\d\d)(.*)$/);
  }
  if (m) {
    const [, country, localNumber] = m;
    return { country, number: localNumber };
  }
  return { number: fullNumber.substring(1) };
}

export function createPhoneNumberPattern(pn: PhoneNumber) {
  if (!pn.country) {
    return new RegExp(`^(\\+\\d\\d|00\\d\\d|0)${pn.number}$`);
  }
  return new RegExp(`^(\\+${pn.country}|00${pn.country}|0)${pn.number}$`);
}

export function phoneNumberPatternEquals(l: RegExp, c: string): boolean {
  return !!c.replace(/[\-\\\/\s()]/g, '').match(l);
}

export function phoneNumberEquals(l: PhoneNumber, c: string): boolean {
  return phoneNumberPatternEquals(createPhoneNumberPattern(l), c);
}
