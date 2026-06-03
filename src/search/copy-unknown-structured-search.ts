import { UrlKitError } from '../errors/url-kit-error.js';
import type { UnknownSearchParams } from '../contracts.js';

export function copyUnknownStructuredSearch(
  input: Readonly<Record<string, unknown>>,
): UnknownSearchParams | undefined {
  const output: Record<string, string | readonly string[]> = {};

  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value === 'string') {
      output[key] = value;
      continue;
    }

    if (Array.isArray(value) && value.every((item) => typeof item === 'string')) {
      output[key] = Object.freeze([...value]);
      continue;
    }

    throw new UrlKitError(
      'invalid-search',
      'Unknown search parameter must be a string or string array to preserve.',
      {
        path: [key],
      },
    );
  }

  if (!Object.keys(output).length) {
    return undefined;
  }

  return Object.freeze(output);
}
