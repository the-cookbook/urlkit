import type { UrlKitErrorCode } from '../errors/contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import type { DateFormatCodec } from './contracts.js';

export interface ParseCustomDateOptions {
  readonly code?: UrlKitErrorCode;
  readonly path?: readonly string[];
}

export function parseCustomDate(
  input: string,
  format: DateFormatCodec,
  options: ParseCustomDateOptions = {},
): Date {
  let value: Date;

  try {
    value = format.parse(input);
  } catch (cause) {
    throw createInvalidCustomDateError('Custom date format parser failed.', options, cause);
  }

  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw createInvalidCustomDateError(
      'Custom date format parser must return a valid Date.',
      options,
    );
  }

  return value;
}

function createInvalidCustomDateError(
  message: string,
  options: ParseCustomDateOptions,
  cause?: unknown,
): UrlKitError {
  return new UrlKitError(options.code ?? 'invalid-search', message, {
    path: [...(options.path ?? [])],
    ...(cause !== undefined ? { cause } : {}),
  });
}
