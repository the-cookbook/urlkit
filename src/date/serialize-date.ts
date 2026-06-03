import type { UrlKitErrorCode } from '../errors/contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';

export interface SerializeDateOptions {
  readonly code?: UrlKitErrorCode;
  readonly path?: readonly string[];
}

export function serializeDate(input: Date, options: SerializeDateOptions = {}): string {
  if (!(input instanceof Date) || !Number.isFinite(input.getTime())) {
    throw new UrlKitError(options.code ?? 'invalid-search', 'Date value must be a valid Date.', {
      path: [...(options.path ?? [])],
    });
  }

  const year = String(input.getUTCFullYear()).padStart(4, '0');
  const month = String(input.getUTCMonth() + 1).padStart(2, '0');
  const day = String(input.getUTCDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}
