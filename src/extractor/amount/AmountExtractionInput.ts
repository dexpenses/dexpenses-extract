import { PaymentMethod } from '@dexpenses/core';
import { AmountValue } from './amount-value.model';

export default interface AmountExtractionInput {
  amountValues: AmountValue[];
  taxUnrelatedAmountValues: number[];
  text: string;
  lines: string[];
  paymentMethod?: PaymentMethod | null;
}
