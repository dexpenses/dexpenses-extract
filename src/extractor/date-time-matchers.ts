import { DateTime } from 'luxon';
import { MatchersDef, statically } from '../utils/matcher/matcher-def';

function currentYear() {
  return DateTime.local().setZone('Europe/Berlin').year;
}

export default {
  d: /(?:[1-9]|[12]\d|3[01])/,
  dd: /(?:0[1-9]|[12]\d|3[01])/,
  M: /(?:[1-9]|1[0-2])/,
  MM: /(?:0[1-9]|1[0-2])/,
  MMM: /(?:jan|feb|märz|apr|mai|jun|jul|aug|sep|okt|nov|dez)/i,
  yyyy: {
    pattern: /(?:19|2\d)\d{2}/,
    check: (m) => parseInt(m, 10) <= currentYear(),
  },
  yy: {
    pattern: /[1-6][0-9]/,
    check(m) {
      return (
        DateTime.fromFormat(m, 'yy', {
          zone: 'Europe/Berlin',
        }).year <= currentYear()
      );
    },
  },
  h: {
    pattern: /(?:[1i][0-2i]|[1-9])/i,
    replacements: [['i', 1]],
  },
  HH: {
    pattern: /(?:[01i][0-9i]|2[0-4i])/i,
    replacements: [['i', 1]],
  },
  mm: {
    pattern: /[0-5i][0-9i]/,
    replacements: [['i', 1]],
  },
  ss: {
    pattern: /[0-5i][0-9i]/,
    replacements: [['i', 1]],
  },
  a: /[AP]M/i,
  ':': statically(/ ?[:;] ?/),
  '.': statically(/ ?[\.,] ?/),
  '-': statically(/ ?- ?/),
  '^': statically(/(?:^| )/, ''),
  $: statically(/(?: |$)/, ''),
} as MatchersDef;
