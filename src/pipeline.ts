import { AmountExtractor } from './extractor/amount';
import { DateExtractor } from './extractor/date';
import { HeaderExtractor } from './extractor/header';
import { PaymentMethodExtractor } from './extractor/paymentMethod';
import { PhoneNumberExtractor } from './extractor/phone';
import DateTimePostProcessor from './postprocess/DateTimePostProcessor';
import { TimeExtractor } from './extractor/time';
import { PlaceExtractor } from './extractor/place';
import PlacePostProcessor from './postprocess/PlacePostProcessor';
import cleanUp from './clean-up';
import HeaderCleanUpPostProcessor from './postprocess/HeaderCleanUpPostProcessor';
import { Receipt } from '@dexpenses/core';

export type ReceiptResultState =
  | 'pending'
  | 'no-text'
  | 'bad-image'
  | 'error'
  | 'unreadable'
  | 'partial'
  | 'ready';

export interface ReceiptResult {
  state: ReceiptResultState;
  data?: Receipt;
  error?: any;
}

export const extractorPipelineFactory = (userData: UserData, config: any) => [
  new HeaderExtractor(),
  new PhoneNumberExtractor(userData.phoneNumber),
  new DateExtractor(),
  new TimeExtractor(),
  new PaymentMethodExtractor(),
  new AmountExtractor(),
  new PlaceExtractor(config.gmaps.key),
];

const postProcessors = [
  new HeaderCleanUpPostProcessor(),
  new DateTimePostProcessor(),
  new PlacePostProcessor(),
];

export function isReady({ header, date, amount }: Receipt): boolean {
  return !!header && header.length > 0 && !!date && !!amount;
}

interface UserData {
  phoneNumber?: string;
}

export default async function(
  text: string,
  userData: UserData,
  config: any
): Promise<ReceiptResult> {
  if (!text) {
    return {
      state: 'no-text',
    };
  }
  text = cleanUp(text);
  const extractorPipeline = extractorPipelineFactory(userData, config);
  const lines = text.split('\n');
  const extracted: Receipt = {};
  let anySuccess = false;
  for (const extractor of extractorPipeline) {
    try {
      const value = await extractor.extract(text, lines, extracted);
      extracted[extractor.field] = value;
      if (value) {
        anySuccess = true;
      }
    } catch (e) {
      extracted[extractor.field] = {
        error: e.message || (typeof e === 'string' && e) || 'unknown',
      };
    }
  }
  if (!anySuccess) {
    return {
      state: 'unreadable',
      data: extracted, // could contains errors
    };
  }
  for (const postProcessor of postProcessors) {
    postProcessor.touch(extracted);
  }
  return {
    state: isReady(extracted) ? 'ready' : 'partial',
    data: extracted,
  };
}
