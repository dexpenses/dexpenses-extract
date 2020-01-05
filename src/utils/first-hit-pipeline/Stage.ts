import PreConditionedStage from './PreConditionedStage';

export default interface Stage<I, O> {
  process(input: I): O | null;
}

export function fn<I, O>(process: (input: I) => O | null): Stage<I, O> {
  return {
    process,
  };
}

export function processIf<I, O>(
  condition: (input: I) => boolean,
  process: (input: I) => O
): PreConditionedStage<I, O> {
  return new (class extends PreConditionedStage<I, O> {
    condition = condition;
    doProcess = process;
  })();
}
