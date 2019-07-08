import { DateExtractor } from './date';
import { DateTime } from 'luxon';

describe('Date extractor', () => {
  const extractor = new DateExtractor();

  it('should be successfully extract the date', () => {
    const text = `22.01.201
    Datum: 22.01.2019
    `;
    const date = extractor.extract(text, text.split('\n'), {});
    expect(date).toBeDefined();
    if (date) {
      expect(date).toEqual(
        DateTime.fromISO('2019-01-22T00:00:00.000+01:00').toJSDate()
      );
    }
  });
});
