import { getAllMatches, getMatchingPatterns } from '../../utils/regex-utils';
import { Meta as DateMeta } from '../date';
import { intersects } from '../../utils/text-range';
import {
  Model,
  ModelDefinition,
  AmountValue,
  IllegalPattern,
} from './amount-value.model';
import defaultModel from './amount-value.model.de';

export class AmountValuesExtractor {
  private model: Model;

  constructor(model: ModelDefinition = defaultModel) {
    this.model = Model.parseAndValidate(model);
  }

  extract(text: string, meta?: DateMeta): AmountValue[] {
    const matches = getAllMatches(this.model.amountValuePattern, text);
    const values: AmountValue[] = [];
    for (const match of matches) {
      // check that matched date is not mistaken as amount
      if (
        meta &&
        intersects({ index: match.index, length: match[0].length }, meta)
      ) {
        continue;
      }
      let taxRelated = false;
      function evaluateIllegal(patterns: IllegalPattern[], textPart: string) {
        const matchingPatterns = getMatchingPatterns(patterns, textPart);
        if (matchingPatterns.length === 0) {
          return false;
        }
        if (matchingPatterns.some((p) => p.pattern.taxRelated)) {
          taxRelated = true;
          return false;
        }
        return true;
      }
      const prefix = match.input.slice(0, match.index);
      if (evaluateIllegal(this.model.illegalAmountPrefixPatterns, prefix)) {
        continue;
      }
      const suffix = match.input.slice(match.index + match[0].length);
      if (evaluateIllegal(this.model.illegalAmountSuffixPatterns, suffix)) {
        continue;
      }

      if (!taxRelated) {
        values.push({ value: this.parse(match[1]), taxRelated: false });
      }
    }
    return values;
  }

  parse(input: string): number {
    for (const [original, replacement] of this.model.replacements) {
      input = input.replace(original, replacement);
    }
    return parseFloat(input);
  }
}
