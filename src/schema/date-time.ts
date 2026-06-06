import type { DateFormatCodec, DateFormatString } from '../date/contracts.js';
import { validateDateFormatString } from '../date/date-format-string.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import type { DateOptions, DateSchema } from './date.js';
import { date } from './date.js';

export type DateTimeFormat = 'date-time' | DateFormatString | DateFormatCodec;

export interface DateTimeSchema<
  Format extends DateTimeFormat = 'date-time',
> extends DateSchema<Format> {}

export interface DateTimeOptions<Format extends DateTimeFormat = 'date-time'> {
  readonly format?: Format;
}

export function dateTime(): DateTimeSchema;
export function dateTime<const Format extends DateTimeFormat>(
  options: DateTimeOptions<Format>,
): DateTimeSchema<Format>;
export function dateTime(
  options: DateTimeOptions<DateTimeFormat> = {},
): DateTimeSchema<DateTimeFormat> {
  const format = resolveDateTimeFormat(options);

  return createDateTimeSchema({ format });
}

function createDateTimeSchema(
  options: DateOptions<DateTimeFormat>,
): DateTimeSchema<DateTimeFormat> {
  return (
    date as unknown as (
      options: DateOptions<DateTimeFormat>,
      formatStringMode: 'date-time',
    ) => DateTimeSchema<DateTimeFormat>
  )(options, 'date-time');
}

function resolveDateTimeFormat(options: DateTimeOptions<DateTimeFormat>): DateTimeFormat {
  if (!isDateTimeOptions(options)) {
    throw new UrlKitError('invalid-descriptor', 'Date-time options must be an object.');
  }

  const format = options.format ?? 'date-time';

  if (format === 'date-time' || isDateFormatCodec(format)) {
    return format;
  }

  if (isDisallowedBuiltInDateTimeFormat(format)) {
    throw new UrlKitError(
      'invalid-descriptor',
      'Date-time format must be "date-time", a supported date-time format string, or an explicit codec.',
    );
  }

  if (isDateFormatString(format)) {
    validateDateFormatString(format, 'date-time');
    return format;
  }

  throw new UrlKitError(
    'invalid-descriptor',
    'Date-time format must be "date-time", a supported date-time format string, or an explicit codec.',
  );
}

function isDateTimeOptions(input: unknown): input is DateTimeOptions<DateTimeFormat> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function isDateFormatString(input: unknown): input is DateFormatString {
  return typeof input === 'string';
}

function isDisallowedBuiltInDateTimeFormat(input: unknown): boolean {
  return input === 'date' || input === 'unix-seconds' || input === 'unix-ms';
}

function isDateFormatCodec(input: unknown): input is DateFormatCodec {
  return (
    typeof input === 'object' &&
    input !== null &&
    typeof (input as Partial<DateFormatCodec>).parse === 'function' &&
    typeof (input as Partial<DateFormatCodec>).serialize === 'function'
  );
}
