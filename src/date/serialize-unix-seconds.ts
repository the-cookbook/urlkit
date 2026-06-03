import type { UrlKitErrorCode } from '../errors/contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';

export interface SerializeUnixSecondsOptions {
  readonly code?: UrlKitErrorCode;
  readonly path?: readonly string[];
}

export function serializeUnixSeconds(
  input: Date,
  options: SerializeUnixSecondsOptions = {},
): string {
  if (!(input instanceof Date) || !Number.isFinite(input.getTime())) {
    throw createInvalidUnixSecondsError('Unix seconds value must be a valid Date.', options);
  }

  const milliseconds = input.getTime();

  if (!Number.isInteger(milliseconds) || milliseconds % 1000 !== 0) {
    throw createInvalidUnixSecondsError(
      'Unix seconds value must serialize to finite integer seconds.',
      options,
    );
  }

  const seconds = milliseconds / 1000;

  if (!Number.isFinite(seconds) || !Number.isInteger(seconds)) {
    throw createInvalidUnixSecondsError(
      'Unix seconds value must serialize to finite integer seconds.',
      options,
    );
  }

  return String(seconds);
}

function createInvalidUnixSecondsError(
  message: string,
  options: SerializeUnixSecondsOptions,
): UrlKitError {
  return new UrlKitError(options.code ?? 'invalid-search', message, {
    path: [...(options.path ?? [])],
  });
}
