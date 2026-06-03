import type { UrlKitErrorCode } from '../errors/contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';

const datePattern = /^(\d{4})-(\d{2})-(\d{2})$/;

export interface ParseDateOptions {
  readonly code?: UrlKitErrorCode;
  readonly path?: readonly string[];
}

export function parseDate(input: string, options: ParseDateOptions = {}): Date {
  const match = datePattern.exec(input);

  if (!match) {
    throw createInvalidDateError('Date value must use YYYY-MM-DD format.', options);
  }

  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    throw createInvalidDateError('Date value must be a valid calendar date.', options);
  }

  const value = new Date(Date.UTC(0, month - 1, day));
  value.setUTCFullYear(year);

  if (
    value.getUTCFullYear() !== year ||
    value.getUTCMonth() !== month - 1 ||
    value.getUTCDate() !== day ||
    value.getUTCHours() !== 0 ||
    value.getUTCMinutes() !== 0 ||
    value.getUTCSeconds() !== 0 ||
    value.getUTCMilliseconds() !== 0
  ) {
    throw createInvalidDateError('Date value must be a valid calendar date.', options);
  }

  return value;
}

function createInvalidDateError(message: string, options: ParseDateOptions): UrlKitError {
  return new UrlKitError(options.code ?? 'invalid-search', message, {
    path: [...(options.path ?? [])],
  });
}
