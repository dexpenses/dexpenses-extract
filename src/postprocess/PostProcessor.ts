import { Receipt } from '@dexpenses/core';

export default abstract class PostProcessor {
  public abstract touch(extracted: Receipt): void;
}
