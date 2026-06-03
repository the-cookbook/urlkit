import type { RawSearchParams, RawSearchValue } from './contracts.js';

export function omitRawSearch(input: RawSearchParams, keys: readonly string[]): RawSearchParams {
  const keySet = new Set(keys);
  const output: Record<string, RawSearchValue> = {};

  for (const [key, value] of Object.entries(input)) {
    if (keySet.has(key)) {
      continue;
    }

    output[key] = copyRawSearchValue(value);
  }

  return Object.freeze(output);
}

export function pickRawSearch(input: RawSearchParams, keys: readonly string[]): RawSearchParams {
  const keySet = new Set(keys);
  const output: Record<string, RawSearchValue> = {};

  for (const [key, value] of Object.entries(input)) {
    if (!keySet.has(key)) {
      continue;
    }

    output[key] = copyRawSearchValue(value);
  }

  return Object.freeze(output);
}

function copyRawSearchValue(value: RawSearchValue): RawSearchValue {
  return Array.isArray(value) ? Object.freeze([...value]) : value;
}
