import { Extractor } from './extractor';
import { Receipt } from '@dexpenses/core';

type IrrelevancePattern = RegExp | { pattern: RegExp; minLineIndex: number };

function optionalBetween(word: string): RegExp {
  return new RegExp(word.split('').join('\\s?-?'), 'i');
}

const irrelevantLines: IrrelevancePattern[] = [
  /^Datum:?/i,
  /^[UJ]hrzeit:?/i,
  /^Beleg\s?(\-?\s?Nr\.?|nummer)/i,
  /^Trace(\s*\-?\s*Nr\.?|nummer)/i,
  /B\s?\-?\s?E\s?\-?\s?L\s?\-?\s?E\s?\-?\s?[gqa]/i,
  /h(ae|ä)ndlerbeleg/i,
  /zwischensumme/i,
  { pattern: /^Fax[.:]?(\s|$)/i, minLineIndex: 1 },
  /^Term(inal)?[\-\s]?ID/i,
  /^TA\-?Nr/i,
  /^\(?\s?[O0]rtstarif\s?\)?$/i,
  /^UID$/i,
  /^Vielen Dank/i,
  /^[a-z][^a-z\d]$/i, // indicate wrongly detected text
  /^\d{1,4}$/,
  /Lieferzeit/,
  /(^|\s)karten\s?beleg(\s|$)/i,
  /Tankstellen-?Nr\.?:?/i,
  /^Ust-?ID\.?/i,
  optionalBetween('QUITTUNG'),
  { pattern: /^\d*\s?total\s?\d*$/i, minLineIndex: 1 },
  /^Rechnung$/i,
  /^Kellner:?\s?\d+$/i,
  /^Tisch:?\s?\d+\s?[a-z]?$/i,
  /^Arbeitszettel$/i,
];

const irrelevantPatterns = [
  /Bedient von: [a-z]+/i,
  /www?\s?\.\s?[a-z\-]+\s?\.\s?[a-z]+(\/[a-z\-_\d%]+)*\/?/i,
  /Vielen Dank/i,
  /Bis bald!?/i,
  /Obj(\.|ekt)-?Nr\.?:?\s?\d+(\s|$)/i,
  /K[SA]\.\s?\d+/i,
  /ID \d+/i,
  /^:\s*/,
  /Bed\.?Nr\.?:?\s?\d+/i,
  /Kasse\s?\d+/i,
  /BNr\.?\s?\d+/i,
  /wir haben f(ü|ue?)r sie ge(ö|oe?)ffnet[:!\.]?/i,
  /t(ä|ae?)glich ab \d+( uhr)?/i,
  /rgnr\.?:?\s?\w+/i,
  /Zahlungsart/i,
  /Kellner:?\s?\d+/i,
  /Tisch:?\s?\d+/i,
  /Arbeitszettel/i,
  /(sagt )?danke f(ü|ue?)r Ihren Einkauf/i,
  /(und )?auf Wiedersehen/i,
];

const irrelevantMultiLinePatterns = [
  /wir danken\sf(ü|ue?)r ihren einkauf[!.]?/gim,
];

const fixes = [
  {
    pattern: /(^|\s)6mbH(\s|$)/i,
    replaceWith: '$1GmbH$2',
  },
];

type HeaderDelimiter =
  | RegExp
  | {
      pattern: RegExp;
      negative?: boolean;
      minLine?: number;
    };

const headerDelimiters: HeaderDelimiter[] = [
  { pattern: /[\d\w]/, negative: true },
  /^\s*Artikelname\s*$/i,
  /^\s*Preis:?\s*$/i,
  /^UID\sNr/i,
  /^\s*EUR\s*$/i,
  /^\s*\d+[,.]\d\d\s*$/i,
  /^\s*St\.?Nr\.?/i,
  /[oö]ffnungszeit(en)?/i,
  /(^|\s)Kartenzahlu[np]g($|\s)/i,
  /(^|\s)Bezahlung($|\s)/i,
  /^€/i,
  /^\d+\sCashier$/i,
  { pattern: /Quittung/i, minLine: 5 },
];

export class HeaderExtractor extends Extractor<string[]> {
  constructor(
    protected options = {
      maxHeaderLines: 8,
    }
  ) {
    super('header');
  }

  public extract(text: string, lines: string[], extracted: Receipt) {
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
      if (HeaderExtractor.isIrrelevantLine(line, i - firstHeaderLine)) {
        continue;
      }
      if (!line.trim() || this._isHeaderDelimiter(line, i - firstHeaderLine)) {
        break;
      }
      headerLines.push(HeaderExtractor.trim(line));
    }
    const wrapper = { header: [...new Set(headerLines)] };
    for (const irrelevantPattern of irrelevantPatterns) {
      cleanHeaders(wrapper, irrelevantPattern);
    }
    let headerText = wrapper.header.join('\n');
    for (const irrelevantMultiLinePattern of irrelevantMultiLinePatterns) {
      headerText = headerText.replace(irrelevantMultiLinePattern, '');
    }
    const header = headerText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l);
    return header.map((line) => {
      for (const fix of fixes) {
        line = line.replace(fix.pattern, fix.replaceWith);
      }
      return line;
    });
  }

  static isIrrelevantLine(line: string, index: number): boolean {
    return (
      line.length <= 1 ||
      irrelevantLines.some((r) => {
        if (r instanceof RegExp) {
          return line.match(r);
        }
        return index >= r.minLineIndex && line.match(r.pattern);
      })
    );
  }

  /**
   * Trims the header line from *, x and spaces
   *
   * @param line the line to trim
   * @example '**** Header****' -> 'Header'
   * @example '*xxx Header*xx*' -> 'Header'
   */
  static trim(line: string): string {
    return line
      .trim()
      .replace(/^[\s*xжN]*[\s*ж]/i, '')
      .replace(/[\s*ж][\s*жxN]*$/i, '');
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
        !HeaderExtractor.isIrrelevantLine(line, i) &&
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
  return sanitizedLine
    .trim()
    .replace(/^[,.\/]/, '')
    .replace(/[,.\/]$/, '')
    .trim();
}
