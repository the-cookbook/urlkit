import type { RawSearchValue } from './contracts.js';

export function appendRawSearchValue(
  output: Record<string, RawSearchValue>,
  key: string,
  value: string,
): void {
  const current = output[key];

  if (current === undefined) {
    output[key] = value;
    return;
  }

  output[key] = Object.freeze(Array.isArray(current) ? [...current, value] : [current, value]);
}
