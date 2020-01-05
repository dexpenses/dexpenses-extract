import Stage from './Stage';

export default class FirstHitPipeline<I, O> {
  private readonly stages: Array<Stage<I, O>>;
  constructor(stages: Array<Stage<I, O>>) {
    this.stages = stages;
  }

  run(input: I): O | null {
    for (const stage of this.stages) {
      const value = stage.process(input);
      if (value !== null) {
        return value;
      }
    }
    return null;
  }
}
