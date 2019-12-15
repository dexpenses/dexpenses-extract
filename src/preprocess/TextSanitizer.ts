import PreProcessor from '../pipeline/PreProcessor';

const ODD_CHAR_MAPPINGS = {
  θ: '0',
};

export default class TextSanitizer extends PreProcessor {
  public preProcess(text: string): string | null | undefined {
    let sanitized = text;
    Object.entries(ODD_CHAR_MAPPINGS).forEach(([odd, replacement]) => {
      sanitized = sanitized.replace(new RegExp(odd, 'gi'), replacement);
    });
    return sanitized;
  }
}
