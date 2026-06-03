import { UrlKitError } from '../errors/url-kit-error.js';
import type { SearchFieldType } from './contracts.js';

export function normalizeSearchFieldType(input: unknown): SearchFieldType {
  if (input === undefined || input === 'one') {
    return 'one';
  }

  if (input === 'many') {
    return 'many';
  }

  throw new UrlKitError('invalid-descriptor', 'Search field type must be "one" or "many".');
}
