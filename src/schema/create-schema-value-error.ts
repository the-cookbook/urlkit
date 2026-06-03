import type { UrlKitErrorCode } from '../errors/contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';

export function createSchemaValueError(
  code: UrlKitErrorCode,
  message: string,
  path: readonly string[],
  cause?: unknown,
): UrlKitError {
  return new UrlKitError(code, message, {
    path,
    ...(cause !== undefined ? { cause } : {}),
  });
}
