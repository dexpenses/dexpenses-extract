import Stage from './Stage';
import { Receipt } from '@dexpenses/core';

export type ReceiptResultState = 'no-text' | 'unreadable' | 'partial' | 'ready';

export interface ExtractedReceipt {
  state: ReceiptResultState;
  data?: Receipt;
}

export function isReceiptReady({ header, date, amount }: Receipt): boolean {
  return !!header && header.length > 0 && !!date && !!amount;
}

function anySuccess(extracted: Receipt) {
  return Object.entries(extracted).some(
    ([, value]) => value !== null && value !== undefined
  );
}

export default class Pipeline {
  constructor(private pipeline: Array<Stage | Stage[]>) {
    const stages: Stage[] = pipeline.flat();
    for (const stage of stages) {
      if (!stage.$dependencyMap) {
        continue;
      }
      for (const [prop, dep] of Object.entries(stage.$dependencyMap)) {
        stage[prop] = stages.find((s) => s.constructor === dep);
        if (!stage[prop]) {
          throw new Error(
            `Dependency of property "${prop}" on "${dep}" cannot be satisfied.`
          );
        }
      }
    }
  }

  async run(text: string): Promise<ExtractedReceipt> {
    if (!text) {
      return {
        state: 'no-text',
      };
    }
    const extracted: Receipt = {};
    const data = { text, extracted, lines: text.split('\n') };
    for (const stage of this.pipeline) {
      if (Array.isArray(stage)) {
        await Promise.all(stage.map((s) => s.process(data)));
      } else {
        await stage.process(data);
      }
    }
    if (!anySuccess(extracted)) {
      return {
        state: 'unreadable',
        data: extracted, // could contains errors
      };
    }
    return {
      state: isReceiptReady(extracted) ? 'ready' : 'partial',
      data: extracted,
    };
  }
}
