import { UserData } from '@dexpenses/core';
import { AmountExtractor } from '../extractor/amount';
import { DateExtractor } from '../extractor/date';
import { HeaderExtractor } from '../extractor/header';
import { PaymentMethodExtractor } from '../extractor/paymentMethod';
import { PhoneNumberExtractor } from '../extractor/phone';
import { TimeExtractor } from '../extractor/time';
import { PlaceExtractor } from '../extractor/place';
import DateTimePostProcessor from '../postprocess/DateTimePostProcessor';
import PlacePostProcessor from '../postprocess/PlacePostProcessor';
import HeaderCleanUpPostProcessor from '../postprocess/HeaderCleanUpPostProcessor';
import Pipeline, { ExtractedReceipt } from './Pipeline';
import TextSanitizer from '../preprocess/TextSanitizer';

export interface Config {
  gmaps: {
    key: string;
  };
}

export function getPipelineStages(config: Config, userData: UserData) {
  return [
    new TextSanitizer(),
    new HeaderExtractor(),
    [
      new PhoneNumberExtractor(userData.phoneNumber),
      new DateExtractor(),
      new TimeExtractor(),
      new PaymentMethodExtractor(),
    ],
    [
      new AmountExtractor(),
      new DateTimePostProcessor(),
      new HeaderCleanUpPostProcessor(),
    ],
    new PlaceExtractor(config.gmaps.key),
    new PlacePostProcessor(),
  ];
}

const runPipeline: (
  config: Config
) => (userData: UserData) => (text: string) => Promise<ExtractedReceipt> = (
  config: Config
) => (userData: UserData) => async (text: string) => {
  const pipeline = new Pipeline(getPipelineStages(config, userData));
  return pipeline.run(text);
};
export default runPipeline;
