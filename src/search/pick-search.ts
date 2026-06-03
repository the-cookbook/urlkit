import { buildRawSearch } from './build-raw-search.js';
import { pickRawSearch } from './filter-raw-search.js';
import { parseRawSearch } from './parse-raw-search.js';

export function pickSearch(current: string | URLSearchParams, keys: readonly string[]): string {
  return buildRawSearch(pickRawSearch(parseRawSearch(current), keys));
}
