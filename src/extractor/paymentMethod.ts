import { Extractor } from './extractor';
import { Receipt, PaymentMethod } from '@dexpenses/core';
import { anyLineMatches } from './util';

const paymentMethodIdentifiers: Record<PaymentMethod, RegExp[]> = {
  DEBIT: [
    /(^|\s)[g9]irocar\s?(c|c?d)(\s|$|MAESTRVPAY)/i,
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
    /(^|\s)EC-Cash(\s|$)/i,
    /(^|\s)DEBIT(\s|$)/i,
    /MAESTR CCard/i,
  ],
  CREDIT: [/(^|\s)visa(\s|$)/i, /(^|\s)kreditkarte(\s|$)/i],
  CASH: [/(^|\s)bar(geld|zahlung)?(\s|$)/i, /(^|\s)Gegeben(\s|$)/],
  DKV_CARD: [/DK[VIU](\s|-)Se\s?lection Card/i, /(^|\s)DKV(\s|$)/i],
  PAYPAL: [/(^|\s)PayPal(\s|$)/i],
  ONLINE: [/(^|\s)Onlinezahlung(\s|$)/i, /(^|\s)Online(\s|$)/i],
};

export class PaymentMethodExtractor extends Extractor<PaymentMethod> {
  constructor() {
    super('paymentMethod');
  }

  public extract(
    text: string,
    lines: string[],
    extracted: Receipt
  ): PaymentMethod | null {
    for (const [method, identifiers] of Object.entries(
      paymentMethodIdentifiers
    )) {
      for (const identifier of identifiers) {
        if (
          anyLineMatches(lines, (line) => line.match(identifier)).isPresent()
        ) {
          return method as PaymentMethod;
        }
      }
    }
    return null;
  }
}
