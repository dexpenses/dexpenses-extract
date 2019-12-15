import { Receipt } from '@dexpenses/core';
import Stage, { StageData } from '../pipeline/Stage';

export type Opt<T> = T | undefined | null;

export abstract class Extractor<T> implements Stage {
  constructor(public readonly field: string) {}

  public abstract extract(
    text: string,
    lines: string[],
    extracted: Receipt
  ): Opt<T> | Promise<Opt<T>>;

  public async process(data: StageData): Promise<void> {
    try {
      const value = await this.extract(data.text, data.lines, data.extracted);
      data.extracted[this.field] = value;
    } catch (e) {
      data.extracted[this.field] = {
        error: e.message || (typeof e === 'string' && e) || 'unknown',
      }; // TODO save errors separately on the receipt object!
    }
  }
}
