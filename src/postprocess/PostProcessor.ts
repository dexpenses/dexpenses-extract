import { Receipt } from '@dexpenses/core';
import Stage, { StageData } from '../pipeline/Stage';

export default abstract class PostProcessor implements Stage {
  public abstract touch(extracted: Receipt): void;

  process(data: StageData): void | Promise<void> {
    try {
      this.touch(data.extracted);
    } catch (e) {
      console.error(`Post processor "${this.constructor.name}" thew error:`, e);
    }
  }
}
