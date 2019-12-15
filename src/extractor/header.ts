import { Extractor } from './extractor';
import { Receipt } from '@dexpenses/core';
import model from './header.model.de';
import HeaderExtractorOptions from './header.model';

export class HeaderExtractor extends Extractor<string[]> {
  constructor(protected options: HeaderExtractorOptions = model) {
    super('header');
  }

  public extract(fullText: string, fullLines: string[], extracted: Receipt) {
    let text = fullText;
    for (const irrelevantPattern of this.options.irrelevantPatterns) {
      text = text.replace(irrelevantPattern, '');
    }
    let lines = text
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => !!s && s.length >= this.options.minLineLength);
    lines = this._skipToFirstHeaderLine(lines);

    let headerLines: string[] = [];
    for (let i = 0; i < this.options.maxHeaderLines && i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim() || this._isHeaderDelimiter(line, i)) {
        break;
      }
      headerLines.push(this.trim(line));
    }
    headerLines = [...new Set(headerLines)];
    let headerText = headerLines.join('\n');
    for (const irrelevantPattern of this.options.irrelevantPatterns) {
      headerText = headerText.replace(irrelevantPattern, '');
    }
    headerLines = [...new Set(headerText.split('\n'))];
    return headerLines
      .filter((s, i) => !this.isIrrelevantLine(s, i))
      .map((line) => {
        for (const fix of this.options.fixes) {
          line = line.replace(fix.pattern, fix.replaceWith);
        }
        return line;
      });
  }

  public isIrrelevantLine(line: string, index: number): boolean {
    return line.length < model.minLineLength;
  }

  public trim(line: string): string {
    let trimmed = line.trim();
    for (const trimmer of this.options.trimPatterns) {
      trimmed = trimmed.replace(trimmer, '');
    }
    return trimmed.trim();
  }

  private _isHeaderDelimiter(line: string, i?: number): boolean {
    for (const delimiter of this.options.headerDelimiters) {
      if (delimiter instanceof RegExp) {
        if (line.match(delimiter)) {
          return true;
        }
      } else {
        if (
          !!line.match(delimiter.pattern) === !delimiter.negative &&
          (!delimiter.minLine || !i || i >= delimiter.minLine)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  private _skipToFirstHeaderLine(lines: string[]): string[] {
    for (let i = 0; i < lines.length; i += 1) {
      const line = this.trim(lines[i]);
      if (
        line &&
        line.length >= this.options.minLineLength &&
        !this._isHeaderDelimiter(line)
      ) {
        return lines.slice(i);
      }
    }
    return [];
  }

  private _cleanHeaders(
    header: string[] | undefined,
    value: string | RegExp,
    sliceAfterMatch: boolean | ((index: number) => boolean) = false
  ): string[] | undefined {
    if (!header || header.length === 0) {
      return header;
    }
    if (!sliceAfterMatch) {
      return header
        .map((line) => this._sanitize(line, value))
        .filter((line) => !!line);
    }
    for (const [i, line] of header.entries()) {
      if (
        (typeof value === 'string' && line.includes(value)) ||
        line.match(value)
      ) {
        const newHeaders = header.slice(0, i);
        const l = this._sanitize(line, value);
        if (l) {
          newHeaders.push(l);
        }
        if (sliceAfterMatch === true || sliceAfterMatch(i)) {
          return newHeaders;
        }
        const rest = this._cleanHeaders(
          header.slice(i + 1),
          value,
          sliceAfterMatch
        );
        rest!.forEach((r) => newHeaders.push(r));
        return newHeaders;
      }
    }
    return header;
  }

  public cleanHeaders(
    extracted: Receipt,
    value: string | RegExp,
    sliceAfterMatch: boolean | ((index: number) => boolean) = false
  ) {
    if (!extracted.header) {
      return;
    }
    extracted.header = this._cleanHeaders(
      extracted.header,
      value,
      sliceAfterMatch
    );
  }

  private _sanitize(line: string, value?: string | RegExp): string {
    if (!value) {
      return line;
    }
    const sanitizedLine = line.replace(value, '');
    if (sanitizedLine === line) {
      return line;
    }
    return this.trim(sanitizedLine);
  }
}
