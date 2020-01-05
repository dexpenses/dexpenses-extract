import { testSuites, testSuiteMap } from './util';
import { AmountExtractor } from '../src/extractor/amount';
import { PaymentMethodExtractor } from '../src/extractor/paymentMethod';

import Pipeline from '../src/pipeline/Pipeline';
import TextSanitizer from '../src/preprocess/TextSanitizer';
import { DateExtractor } from '../src/extractor/date';
import { AmountValuesExtractor } from '../src/extractor/amount/amount-values';

const pipeline = new Pipeline([
  new TextSanitizer(),
  [new PaymentMethodExtractor(), new DateExtractor()],
  new AmountExtractor(),
]);

async function evaluateAmountValues(text: string) {
  const extracted = await pipeline.run(text);
  text = new TextSanitizer().preProcess(text) || text;
  const amountValues = new AmountValuesExtractor().extract(
    text,
    extracted.meta?.date
  );

  return { extracted, amountValues };
}

const exceptions = {
  'wob-sausalitos-2017.txt': true,
};

describe('Amount values extractor for "ec" receipts', () => {
  it.each(testSuiteMap.ec.map(({ name, path, text }) => [name, path, text]))(
    'should only extract a single value for receipt "%s"',
    async (name, path, text) => {
      const { extracted, amountValues } = await evaluateAmountValues(text);
      if (!extracted.data!.amount) {
        return;
      }

      if (exceptions[name]) {
        expect(amountValues).toMatchSnapshot();
      } else {
        expect(amountValues).toHaveLength(1);
        expect(amountValues[0].value).toEqual(extracted.data!.amount!.value);
        expect(amountValues[0].taxRelated).toBeFalsy();
      }
    }
  );
});

describe.each(testSuites.filter(([category]) => category !== 'ec'))(
  'Amount values extractor for "%s" receipts',
  (suite, cases) => {
    it.each(cases)(
      'should extract all relevant amount values from "%s"',
      async (name, path, text) => {
        const { extracted, amountValues } = await evaluateAmountValues(text);
        expect(amountValues).toMatchSnapshot();
        if (extracted.data?.amount) {
          expect(amountValues).toContainEqual({
            value: extracted.data!.amount!.value,
            taxRelated: false,
          });
        }
      }
    );
  }
);
