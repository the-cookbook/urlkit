import type { RawSearchParams, RawSearchValue } from './contracts.js';
import { appendRawSearchValue } from './append-raw-search-value.js';
import { createSearchParams } from './create-search-params.js';

export function parseRawSearch(input: string | URLSearchParams): RawSearchParams {
  const output: Record<string, RawSearchValue> = {};

  for (const [key, value] of createSearchParams(input)) {
    appendRawSearchValue(output, key, value);
  }

  return Object.freeze(output);
}
