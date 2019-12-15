import Stage, { StageData } from './Stage';

export default abstract class PreProcessor implements Stage {
  process(data: StageData): void | Promise<void> {
    const newText = this.preProcess(data.text);
    if (!newText) {
      return;
    }
    data.text = newText;
    data.lines = newText.split('\n');
  }

  public abstract preProcess(text: string): string | undefined | null;
}
