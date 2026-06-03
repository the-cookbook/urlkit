import type { UrlKitErrorCode } from '../errors/contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';

const dateTimePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})Z$/;

export interface ParseDateTimeOptions {
  readonly code?: UrlKitErrorCode;
  readonly path?: readonly string[];
}

export function parseDateTime(input: string, options: ParseDateTimeOptions = {}): Date {
  const match = dateTimePattern.exec(input);

  if (!match) {
    throw createInvalidDateTimeError(
      'Date-time value must use UTC YYYY-MM-DDTHH:mm:ss.sssZ format.',
      options,
    );
  }

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, millisecondText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);
  const millisecond = Number(millisecondText);

  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59 || second > 59) {
    throw createInvalidDateTimeError(
      'Date-time value must be a valid UTC calendar instant.',
      options,
    );
  }

  const value = new Date(Date.UTC(0, month - 1, day, hour, minute, second, millisecond));
  value.setUTCFullYear(year);

  if (
    value.getUTCFullYear() !== year ||
    value.getUTCMonth() !== month - 1 ||
    value.getUTCDate() !== day ||
    value.getUTCHours() !== hour ||
    value.getUTCMinutes() !== minute ||
    value.getUTCSeconds() !== second ||
    value.getUTCMilliseconds() !== millisecond
  ) {
    throw createInvalidDateTimeError(
      'Date-time value must be a valid UTC calendar instant.',
      options,
    );
  }

  return value;
}

function createInvalidDateTimeError(message: string, options: ParseDateTimeOptions): UrlKitError {
  return new UrlKitError(options.code ?? 'invalid-search', message, {
    path: [...(options.path ?? [])],
  });
}
