import { Receipt } from '@dexpenses/core';
import { Injectable } from './Inject';

export interface StageData {
  text: string;
  lines: string[];
  extracted: Receipt;
}

export default interface Stage extends Injectable {
  $dependsOn?: Array<new () => Stage>;

  process(data: StageData): void | Promise<void>;
}
