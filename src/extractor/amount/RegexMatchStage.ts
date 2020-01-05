import PreConditionedStage from '../../utils/first-hit-pipeline/PreConditionedStage';
import { anyMatches } from '../util';
import AmountExtractionInput from './AmountExtractionInput';

export default class RegexMatchStage extends PreConditionedStage<
  AmountExtractionInput,
  number
> {
  constructor(
    private patterns: RegExp[],
    private parse: (match: RegExpMatchArray) => number,
    condition?: (input: AmountExtractionInput) => boolean
  ) {
    super(condition);
  }

  public doProcess({ text }: AmountExtractionInput): number | null {
    return anyMatches(text, this.patterns).then((m) => this.parse(m));
  }
}
