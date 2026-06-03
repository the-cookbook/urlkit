import type { RawSearchParams, RawSearchValue } from './contracts.js';

export function copyRawSearchParams(input: RawSearchParams): RawSearchParams {
  const output: Record<string, RawSearchValue> = {};

  for (const [key, value] of Object.entries(input)) {
    output[key] = Array.isArray(value) ? Object.freeze([...value]) : value;
  }

  return Object.freeze(output);
}
