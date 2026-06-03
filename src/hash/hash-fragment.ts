import { UrlKitError } from '../errors/url-kit-error.js';

export function readHashFragment(input: unknown): string | undefined {
  if (input === undefined || input === null) {
    return undefined;
  }

  if (input instanceof URL) {
    return readHashFragment(input.hash);
  }

  if (typeof input !== 'string') {
    throw new UrlKitError('invalid-hash', 'Hash must be a string.');
  }

  const withoutPrefix = input.startsWith('#') ? input.slice(1) : input;

  if (!withoutPrefix) {
    return undefined;
  }

  try {
    return decodeURIComponent(withoutPrefix);
  } catch (error) {
    throw new UrlKitError('invalid-hash', 'Hash is not valid URL encoding.', {
      path: ['hash'],
      cause: error,
    });
  }
}

export function writeHashFragment(input: string): string {
  return `#${encodeURIComponent(input)}`;
}
