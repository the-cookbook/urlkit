import type { UrlKitErrorCode } from '../errors/contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import type { DateFormatCodec } from './contracts.js';

export interface SerializeCustomDateOptions {
  readonly code?: UrlKitErrorCode;
  readonly path?: readonly string[];
}

export function serializeCustomDate(
  input: Date,
  format: DateFormatCodec,
  options: SerializeCustomDateOptions = {},
): string {
  if (!(input instanceof Date) || !Number.isFinite(input.getTime())) {
    throw createInvalidCustomDateError('Custom date format value must be a valid Date.', options);
  }

  let value: string;

  try {
    value = format.serialize(input);
  } catch (cause) {
    throw createInvalidCustomDateError('Custom date format serializer failed.', options, cause);
  }

  if (typeof value !== 'string' || value === '') {
    throw createInvalidCustomDateError(
      'Custom date format serializer must return a non-empty string.',
      options,
    );
  }

  return value;
}

function createInvalidCustomDateError(
  message: string,
  options: SerializeCustomDateOptions,
  cause?: unknown,
): UrlKitError {
  return new UrlKitError(options.code ?? 'invalid-search', message, {
    path: [...(options.path ?? [])],
    ...(cause !== undefined ? { cause } : {}),
  });
}
