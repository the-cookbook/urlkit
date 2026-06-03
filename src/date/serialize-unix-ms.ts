import type { UrlKitErrorCode } from '../errors/contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';

export interface SerializeUnixMsOptions {
  readonly code?: UrlKitErrorCode;
  readonly path?: readonly string[];
}

export function serializeUnixMs(input: Date, options: SerializeUnixMsOptions = {}): string {
  if (!(input instanceof Date) || !Number.isFinite(input.getTime())) {
    throw createInvalidUnixMsError('Unix milliseconds value must be a valid Date.', options);
  }

  const milliseconds = input.getTime();

  if (!Number.isFinite(milliseconds) || !Number.isInteger(milliseconds)) {
    throw createInvalidUnixMsError(
      'Unix milliseconds value must serialize to finite integer milliseconds.',
      options,
    );
  }

  return String(milliseconds);
}

function createInvalidUnixMsError(message: string, options: SerializeUnixMsOptions): UrlKitError {
  return new UrlKitError(options.code ?? 'invalid-search', message, {
    path: [...(options.path ?? [])],
  });
}
