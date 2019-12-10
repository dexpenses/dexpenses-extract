import { RegExpMatcher, withSanityCheck, statically } from '../utils/matcher';
import { DateTime } from 'luxon';

function currentYear() {
  return new Date().getFullYear();
}

export default {
  d: /([1-9]|[12]\d|3[01])/,
  dd: /(0[1-9]|[12]\d|3[01])/,
  M: /([1-9]|1[0-2])/,
  MM: /(0[1-9]|1[0-2])/,
  MMM: /(jan|feb|märz|apr|mai|jun|jul|aug|sep|okt|nov|dez)/i,
  yyyy: withSanityCheck(
    /((?:19|2\d)\d{2})/,
    (m) => parseInt(m, 10) <= currentYear()
  ),
  yy: withSanityCheck(
    /([1-6][0-9])/,
    (m) =>
      DateTime.fromFormat(m, 'yy', {
        zone: 'Europe/Berlin',
      }).year <= currentYear()
  ),
  h: /([1i][0-2i]|[1-9])/i,
  HH: /([01i][0-9i]|2[0-4i])/i,
  mm: /([0-5i][0-9i])/,
  ss: /([0-5i][0-9i])/,
  ':': statically(/\s?[:;]\s?/),
  a: /([AP]M)/i,
  '§': statically(/(?:^|\s)/),
  '.': statically(/\s?[\.,]\s?/),
  '-': statically(/\s?\-\s?/),
} as Record<string, RegExpMatcher>;
