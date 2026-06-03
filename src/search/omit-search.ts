import { buildRawSearch } from './build-raw-search.js';
import { omitRawSearch } from './filter-raw-search.js';
import { parseRawSearch } from './parse-raw-search.js';

export function omitSearch(current: string | URLSearchParams, keys: readonly string[]): string {
  return buildRawSearch(omitRawSearch(parseRawSearch(current), keys));
}
