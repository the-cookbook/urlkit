import type { DateSchema } from './date.js';
import { date } from './date.js';

export interface DateTimeSchema extends DateSchema<'date-time'> {}

export function dateTime(): DateTimeSchema {
  return date({ format: 'date-time' });
}
