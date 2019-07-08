import { DateTime } from 'luxon';
import { Receipt } from '@dexpenses/core';
import PostProcessor from './PostProcessor';

export default class DateTimePostProcessor extends PostProcessor {
  public touch(extracted: Receipt) {
    if (extracted.date) {
      let timestamp = DateTime.fromJSDate(Receipt.getDate(extracted)!).setZone(
        'Europe/Berlin'
      );
      if (extracted.time) {
        const { hour, minute, second } = extracted.time;
        timestamp = timestamp.set({
          hour,
          minute,
          second: second || undefined,
        });
      }
      extracted.timestamp = timestamp.toJSDate();
    }
  }
}
