import { Receipt } from '@dexpenses/core';
import Stage, { StageData } from '../pipeline/Stage';

export type Optional<T> = T | undefined | null;

export interface Result<T, M = any> {
  value: T;
  meta?: M;
}

export abstract class Extractor<T, M = any> implements Stage {
  constructor(public readonly field: string) {}

  public abstract extract(
    text: string,
    lines: string[],
    extracted: Receipt,
    meta?: Record<string, any>
  ): Optional<Result<T, M>> | Promise<Optional<Result<T, M>>>;

  public async process(data: StageData): Promise<void> {
    try {
      const result = await this.extract(
        data.text,
        data.lines,
        data.extracted,
        data.meta
      );
      if (!result) {
        data.extracted[this.field] = null;
      } else {
        data.extracted[this.field] = result.value;
        if (result.meta) {
          if (!data.meta) {
            data.meta = {};
          }
          data.meta[this.field] = result.meta;
        }
      }
    } catch (e) {
      data.extracted[this.field] = {
        error: e.message || (typeof e === 'string' && e) || 'unknown',
      };
    }
  }
}
