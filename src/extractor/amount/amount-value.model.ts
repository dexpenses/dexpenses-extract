import { captureGroupCount } from '../../utils/regex-utils';

/* tslint:disable:max-classes-per-file */
/* classes only assist the interface definitions */
export interface IllegalPattern {
  pattern: RegExp;
  taxRelated?: boolean;
}
export class IllegalPattern {
  static wrap(pattern: IllegalPattern | RegExp): IllegalPattern {
    if (pattern instanceof RegExp) {
      return {
        pattern,
        taxRelated: false,
      };
    }
    return pattern;
  }
}
export interface ModelDefinition {
  amountValuePattern: RegExp;
  replacements?: Array<[string | RegExp, string]>;
  illegalAmountPrefixPatterns?: Array<IllegalPattern | RegExp>;
  illegalAmountSuffixPatterns?: Array<IllegalPattern | RegExp>;
}
export interface Model {
  amountValuePattern: RegExp;
  replacements: Array<[RegExp, string]>;
  illegalAmountPrefixPatterns: IllegalPattern[];
  illegalAmountSuffixPatterns: IllegalPattern[];
}
function validateAmountValuePattern(amountValuePattern: RegExp) {
  if (captureGroupCount(amountValuePattern) !== 1) {
    throw new Error('amountValuePattern must have a single capture group');
  }
  if (!amountValuePattern.flags.includes('g')) {
    throw new Error('amountValuePattern must have global flag');
  }
  return amountValuePattern;
}
function parseAndValidateIllegalPatterns(
  patterns: Array<IllegalPattern | RegExp> | undefined,
  regex: RegExp
): IllegalPattern[] {
  if (!patterns) {
    return [];
  }
  const wrapped = patterns.map(IllegalPattern.wrap);
  const erronous = wrapped.find((p) => !p.pattern.source.match(regex));
  if (erronous) {
    throw new Error(
      `illegal pattern source ${erronous.pattern} does not match regex ${regex}`
    );
  }
  return wrapped;
}
function parseAndValidateReplacements(
  replacements?: Array<[string | RegExp, string]>
): Array<[RegExp, string]> {
  if (!replacements) {
    return [];
  }
  if (replacements.some(([o]) => !o)) {
    throw new Error('empty replacement pattern is not allowed');
  }
  return replacements.map(
    ([orig, repl]) =>
      [typeof orig === 'string' ? new RegExp(orig, 'g') : orig, repl] as [
        RegExp,
        string
      ]
  );
}
export class Model {
  static parseAndValidate({
    illegalAmountPrefixPatterns,
    illegalAmountSuffixPatterns,
    amountValuePattern,
    replacements,
  }: ModelDefinition): Model {
    return {
      amountValuePattern: validateAmountValuePattern(amountValuePattern),
      illegalAmountPrefixPatterns: parseAndValidateIllegalPatterns(
        illegalAmountPrefixPatterns,
        /(?<!\\)\$$/
      ),
      illegalAmountSuffixPatterns: parseAndValidateIllegalPatterns(
        illegalAmountSuffixPatterns,
        /^\^/
      ),
      replacements: parseAndValidateReplacements(replacements),
    };
  }
}
export interface AmountValue {
  value: number;
  taxRelated?: boolean;
}
