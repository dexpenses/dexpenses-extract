import { Receipt, UserData } from '@dexpenses/core';
import cleanUp from './clean-up';
import { AmountExtractor } from './extractor/amount';
import { DateExtractor } from './extractor/date';
import { HeaderExtractor } from './extractor/header';
import { PaymentMethodExtractor } from './extractor/paymentMethod';
import { PhoneNumberExtractor } from './extractor/phone';
import { TimeExtractor } from './extractor/time';
import { PlaceExtractor } from './extractor/place';
import DateTimePostProcessor from './postprocess/DateTimePostProcessor';
import PlacePostProcessor from './postprocess/PlacePostProcessor';
import HeaderCleanUpPostProcessor from './postprocess/HeaderCleanUpPostProcessor';

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

export const extractorPipelineFactory = (
  userData: UserData,
  config: Config
) => [
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

export interface Config {
  gmaps: {
    key: string;
  };
}

export default (config: Config) => (userData: UserData) => async (
  text: string
) => {
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
};
