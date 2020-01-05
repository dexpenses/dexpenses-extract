import { ModelDefinition } from './amount-value.model';

export default {
  amountValuePattern: /(?:^| |\*)(-?(?:[1-9]\d+|\d)\s?[,.]\s?[\dS]{2})(?:[\-\s€]|$)/gim,
  illegalAmountPrefixPatterns: [
    /AS(-| )Zeit:? ?$/i,
    /punktestand entspricht:? ?$/i,
    { pattern: /MwSt:? ?$/i, taxRelated: true },
    /(Original|Einzel)preis:? ?$/i,
    /PFAND ?$/i,
    /Nachlass:? ?$/i,
    { pattern: /Netto:? ?$/i, taxRelated: true },
    /statt:? ?$/i,
    { pattern: /MwSt\.?\s?%?\n[^\n]*$/i, taxRelated: true },
    /Nachlass:?\s?\n[^\n]*$/i,
  ],
  illegalAmountSuffixPatterns: [/^\s?%/, /^\s?Uhr/i],
  replacements: [
    [/\s/g, ''],
    [',', '.'],
    ['S', '5'],
  ],
} as ModelDefinition;
