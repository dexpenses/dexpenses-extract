export type HeaderDelimiter =
  | RegExp
  | {
      pattern: RegExp;
      negative?: boolean;
      minLine?: number;
    };

export interface HeaderFixes {
  pattern: RegExp;
  replaceWith: string;
}

export default interface HeaderExtractorOptions {
  maxHeaderLines: number;
  minLineLength: number;
  headerDelimiters: HeaderDelimiter[];
  irrelevantPatterns: RegExp[];
  trimPatterns: RegExp[];
  fixes: HeaderFixes[];
}
