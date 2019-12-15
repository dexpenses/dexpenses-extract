import { Extractor } from './extractor';
import { Receipt } from '@dexpenses/core';
import model from './header.model.de';

const irrelevantPatterns = model.irrelevantPatterns;

const fixes = model.fixes;

const headerDelimiters = model.headerDelimiters;

export class HeaderExtractor extends Extractor<string[]> {
  constructor(
    protected options = {
      maxHeaderLines: model.maxHeaderLines,
      minLineLength: model.minLineLength,
    }
  ) {
    super('header');
  }

  public extract(text: string, lines: string[], extracted: Receipt) {
    for (const irrelevantPattern of irrelevantPatterns) {
      text = text.replace(irrelevantPattern, '');
    }
    lines = text
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => !!s && s.length >= this.options.minLineLength);
    text = lines.join('\n');

    const headerLines: string[] = [];

    const firstHeaderLine = this._firstHeaderLine(lines);

    if (firstHeaderLine === -1) {
      return [];
    }
    for (
      let i = firstHeaderLine;
      i < this.options.maxHeaderLines && i < lines.length;
      i++
    ) {
      const line = lines[i];
      if (!line.trim() || this._isHeaderDelimiter(line, i - firstHeaderLine)) {
        break;
      }
      headerLines.push(HeaderExtractor.trim(line));
    }
    const wrapper = { header: [...new Set(headerLines)] };
    let ht = wrapper.header.join('\n');
    for (const irrelevantPattern of irrelevantPatterns) {
      ht = ht.replace(irrelevantPattern, '');
    }
    wrapper.header = [...new Set(ht.split('\n'))];
    return wrapper.header
      .filter((s) => s.length >= this.options.minLineLength)
      .map((line) => {
        for (const fix of fixes) {
          line = line.replace(fix.pattern, fix.replaceWith);
        }
        return line;
      });
  }

  static isIrrelevantLine(line: string, index: number): boolean {
    return line.length < model.minLineLength;
  }

  /**
   * Trims the header line from *, x and spaces
   *
   * @param line the line to trim
   * @example '**** Header****' -> 'Header'
   * @example '*xxx Header*xx*' -> 'Header'
   */
  static trim(line: string): string {
    let trimmed = line.trim();
    for (const trimmer of model.trimPatterns) {
      trimmed = trimmed.replace(trimmer, '');
    }
    return trimmed.trim();
  }

  private _isHeaderDelimiter(line: string, i?: number): boolean {
    for (const delimiter of headerDelimiters) {
      if (delimiter instanceof RegExp) {
        if (line.match(delimiter)) {
          return true;
        }
      } else {
        if (
          (delimiter.negative
            ? !line.match(delimiter.pattern)
            : !!line.match(delimiter.pattern)) &&
          (!delimiter.minLine || !i || i >= delimiter.minLine)
        ) {
          return true;
        }
      }
    }
    return false;
  }

  private _firstHeaderLine(lines: string[]): number {
    for (let i = 0; i < lines.length; i += 1) {
      const line = HeaderExtractor.trim(lines[i]);
      if (
        line &&
        line.length >= this.options.minLineLength &&
        !this._isHeaderDelimiter(line)
      ) {
        return i;
      }
    }
    return -1;
  }
}

function _cleanHeaders(
  header: string[] | undefined,
  value: string | RegExp,
  sliceAfterMatch: boolean | ((index: number) => boolean) = false
): string[] | undefined {
  if (!header || header.length === 0) {
    return header;
  }
  if (!sliceAfterMatch) {
    return header
      .map((line) => _sanitize(line, value))
      .filter((line) => !!line);
  }
  for (const [i, line] of header.entries()) {
    if (
      (typeof value === 'string' && line.includes(value)) ||
      line.match(value)
    ) {
      const newHeaders = header.slice(0, i);
      const l = _sanitize(line, value);
      if (l) {
        newHeaders.push(l);
      }
      if (sliceAfterMatch === true || sliceAfterMatch(i)) {
        return newHeaders;
      }
      const rest = _cleanHeaders(header.slice(i + 1), value, sliceAfterMatch);
      rest!.forEach((r) => newHeaders.push(r));
      return newHeaders;
    }
  }
  return header;
}

export function cleanHeaders(
  extracted: Receipt,
  value: string | RegExp,
  sliceAfterMatch: boolean | ((index: number) => boolean) = false
) {
  if (!extracted.header) {
    return;
  }
  extracted.header = _cleanHeaders(extracted.header, value, sliceAfterMatch);
}

function _sanitize(line: string, value?: string | RegExp): string {
  if (!value) {
    return line;
  }
  const sanitizedLine = line.replace(value, '');
  if (sanitizedLine === line) {
    return line;
  }
  return HeaderExtractor.trim(sanitizedLine);
}
