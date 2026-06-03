import type { ParseRequestOptions, UrlRequestInput } from '../contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';

export function resolveRequestUrlInput(
  input: Request | UrlRequestInput,
  options: ParseRequestOptions = {},
): string | URL {
  const url = readRequestUrl(input);

  if (options.baseUrl) {
    return resolveRequestUrl(url, options.baseUrl);
  }

  return url;
}

function readRequestUrl(input: Request | UrlRequestInput): string {
  if (isRequest(input)) {
    return input.url;
  }

  if (isUrlRequestInput(input)) {
    return input.url;
  }

  throw new UrlKitError(
    'invalid-url',
    'Request input must be a Request or an object with a url string.',
    {
      path: [],
    },
  );
}

function resolveRequestUrl(url: string, baseUrl: string): URL {
  try {
    return new URL(url, baseUrl);
  } catch (error) {
    throw new UrlKitError('invalid-url', 'Request URL is not valid.', {
      path: [],
      cause: error,
    });
  }
}

function isRequest(input: Request | UrlRequestInput): input is Request {
  return typeof Request !== 'undefined' && input instanceof Request;
}

function isUrlRequestInput(input: Request | UrlRequestInput): input is UrlRequestInput {
  return (
    typeof input === 'object' &&
    input !== null &&
    'url' in input &&
    typeof (input as { readonly url?: unknown }).url === 'string'
  );
}
