import { DateTime } from 'luxon';
import { TIMEZONE } from '../constant/global.constant';

export class DateHelper {
  static now(): DateTime {
    return DateTime.now().setZone(TIMEZONE);
  }

  static nowDate(): Date {
    return DateTime.now().setZone(TIMEZONE).toJSDate();
  }
}
