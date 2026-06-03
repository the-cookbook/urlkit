import type { RawSearchParams, RawSearchValue } from './contracts.js';
import { getObjectSearchRawKeyPath } from './object-search-raw-key-path.js';
import { isObjectSearchPathEqual } from './object-search-path-key.js';

export function findObjectSearchRawValue(
  parentKey: string,
  path: readonly string[],
  rawSearch: RawSearchParams,
): RawSearchValue | undefined {
  for (const [rawKey, value] of Object.entries(rawSearch)) {
    const rawPath = getObjectSearchRawKeyPath(parentKey, rawKey);

    if (rawPath && isObjectSearchPathEqual(rawPath, path)) {
      return value;
    }
  }

  return undefined;
}
