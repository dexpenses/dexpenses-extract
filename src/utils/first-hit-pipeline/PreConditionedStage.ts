import Stage from './Stage';

export default abstract class PreConditionedStage<I, O> implements Stage<I, O> {
  protected condition: (input: I) => boolean;

  constructor(condition?: (input: I) => boolean) {
    if (condition) {
      this.condition = condition;
    } else {
      this.condition = () => true;
    }
  }

  public abstract doProcess(input: I): O | null;

  process(input: I): O | null {
    if (!this.condition(input)) {
      return null;
    }
    return this.doProcess(input);
  }
}
