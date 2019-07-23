import { Extractor } from './extractor';
import { Receipt } from '@dexpenses/core';
import { anyLineMatches } from './util';

export enum PaymentMethod {
  DEBIT = 'DEBIT',
  CREDIT = 'CREDIT',
  CASH = 'CASH',
  DKV_CARD = 'DKV_CARD',
  PAYPAL = 'PAYPAL',
  ONLINE = 'ONLINE',
}

const paymentMethodIdentifiers = {
  [PaymentMethod.DEBIT]: [
    /(^|\s)[g9]irocar\s?(c|c?d)(\s|$)/i,
    /zahlart[:\s]\s*EC/i,
    /Euro\s?[EB]LV/i,
    /EC Kartenzahlung/i,
    /(^|\s)EC[\-\s]Card(\s|$)/i,
    /gegeben EC/i,
    /EC[\s\-]Karte/i,
    /gegeben kreditsch\./i,
    /Lastschrift/i,
    /(^|\s)EC(\s|$)/i,
    /(^|\s)SEPA(\s|$)/i,
  ],
  [PaymentMethod.CREDIT]: [/(^|\s)visa(\s|$)/i, /(^|\s)kreditkarte(\s|$)/i],
  [PaymentMethod.CASH]: [
    /(^|\s)bar(geld|zahlung)?(\s|$)/i,
    /(^|\s)Gegeben(\s|$)/,
  ],
  [PaymentMethod.DKV_CARD]: [/DK[VI] Selection Card/i, /(^|\s)DKV(\s|$)/i],
  [PaymentMethod.PAYPAL]: [/(^|\s)PayPal(\s|$)/i],
  [PaymentMethod.ONLINE]: [/(^|\s)Onlinezahlung(\s|$)/i, /(^|\s)Online(\s|$)/i],
};

export class PaymentMethodExtractor extends Extractor<string> {
  constructor() {
    super('paymentMethod');
  }

  public extract(
    text: string,
    lines: string[],
    extracted: Receipt
  ): string | null {
    for (const [method, identifiers] of Object.entries(
      paymentMethodIdentifiers
    )) {
      for (const identifier of identifiers) {
        if (
          anyLineMatches(lines, (line) => line.match(identifier)).isPresent()
        ) {
          return method;
        }
      }
    }
    return null;
  }
}
