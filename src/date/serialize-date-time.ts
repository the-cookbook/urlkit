import type { UrlKitErrorCode } from '../errors/contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';

const serializedDateTimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

export interface SerializeDateTimeOptions {
  readonly code?: UrlKitErrorCode;
  readonly path?: readonly string[];
}

export function serializeDateTime(input: Date, options: SerializeDateTimeOptions = {}): string {
  if (!(input instanceof Date) || !Number.isFinite(input.getTime())) {
    throw createInvalidDateTimeError('Date-time value must be a valid Date.', options);
  }

  const value = input.toISOString();

  if (!serializedDateTimePattern.test(value)) {
    throw createInvalidDateTimeError(
      'Date-time value must serialize to YYYY-MM-DDTHH:mm:ss.sssZ.',
      options,
    );
  }

  return value;
}

function createInvalidDateTimeError(
  message: string,
  options: SerializeDateTimeOptions,
): UrlKitError {
  return new UrlKitError(options.code ?? 'invalid-search', message, {
    path: [...(options.path ?? [])],
  });
}
