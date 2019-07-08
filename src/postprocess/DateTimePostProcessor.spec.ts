import DateTimePostProcessor from './DateTimePostProcessor';
import { DateTime } from 'luxon';

describe('Date time postprocessor', () => {
  const postprocessor = new DateTimePostProcessor();

  it('should be successfully create timestamp', () => {
    const extracted: any = {
      date: DateTime.fromFormat('22.02.2019', 'dd.MM.yyyy', {
        zone: 'Europe/Berlin',
      }).toJSDate(),
      time: {
        hour: 11,
        minute: 12,
        second: 13,
      },
    };
    postprocessor.touch(extracted);
    expect(extracted).toHaveProperty('timestamp');
    expect(extracted.timestamp).toEqual(
      DateTime.fromISO('2019-02-22T11:12:13.000+01:00').toJSDate()
    );
  });
});
