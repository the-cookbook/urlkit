import { UrlKitError } from '../errors/url-kit-error.js';

const URLKIT_BASE_URL = 'http://urlkit.local';

export interface ParsedUrlInput {
  readonly pathname: string;
  readonly searchParams: URLSearchParams;
  readonly hash: string;
}

export function parseUrl(input: string | URL): ParsedUrlInput {
  if (input instanceof URL) {
    return freezeParsedUrlInput(input);
  }

  if (typeof input !== 'string') {
    throw new UrlKitError('invalid-url', 'URL input must be a string or URL.', { path: [] });
  }

  try {
    return freezeParsedUrlInput(new URL(input, URLKIT_BASE_URL));
  } catch (error) {
    throw new UrlKitError('invalid-url', 'URL input is not valid.', { path: [], cause: error });
  }
}

function freezeParsedUrlInput(input: URL): ParsedUrlInput {
  return Object.freeze({
    pathname: input.pathname,
    searchParams: new URLSearchParams(input.searchParams),
    hash: input.hash,
  });
}
