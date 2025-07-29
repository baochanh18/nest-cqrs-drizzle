import { Global, Injectable, Module } from '@nestjs/common';
import * as dayjs from 'dayjs';

const JST_OFFSET_HOURS = 9; // Japan Standard Time is UTC+9

@Injectable()
export class DateTimeService {
  /**
   * Get current timestamp in ISO format
   */
  now(): string {
    return dayjs().toISOString();
  }

  /**
   * Get current timestamp in UTC ISO format
   */
  utcNow(): string {
    return dayjs().toISOString();
  }

  /**
   * Get current timestamp in JST (Japan Standard Time)
   * JST is UTC+9, so we add 9 hours to current time
   */
  jstNow(): string {
    return dayjs().add(JST_OFFSET_HOURS, 'hour').format('YYYY-MM-DD HH:mm:ss');
  }

  /**
   * Convert date to JST format
   * JST is UTC+9, so we add 9 hours to the given time
   */
  toJST(date?: string | Date, formatStr = 'YYYY-MM-DD HH:mm:ss'): string {
    return dayjs(date).add(JST_OFFSET_HOURS, 'hour').format(formatStr);
  }

  /**
   * Format date to ISO string
   */
  toISOString(date?: string | Date): string {
    return dayjs(date).toISOString();
  }

  /**
   * Format date with custom format
   */
  format(date?: string | Date, formatStr = 'YYYY-MM-DD HH:mm:ss'): string {
    return dayjs(date).format(formatStr);
  }

  /**
   * Format date in JST timezone with custom format
   * JST is UTC+9, so we add 9 hours to the given time
   */
  formatJST(date?: string | Date, formatStr = 'YYYY-MM-DD HH:mm:ss'): string {
    return dayjs(date).add(JST_OFFSET_HOURS, 'hour').format(formatStr);
  }
}

@Global()
@Module({
  providers: [DateTimeService],
  exports: [DateTimeService],
})
export class DateTimeModule {}

export { dayjs };
