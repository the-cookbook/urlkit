import { UrlKitError } from '../errors/url-kit-error.js';
import type { RawSearchParams } from './contracts.js';
import { getObjectSearchRawKeyPath } from './object-search-raw-key-path.js';
import { createObjectSearchPathKey } from './object-search-path-key.js';

export function assertNoObjectSearchCollisions(
  parentKey: string,
  rawSearch: RawSearchParams,
  parentPath: readonly string[],
): void {
  const paths = new Map<
    string,
    { readonly path: readonly string[]; readonly rawKeys: Set<string> }
  >();

  for (const rawKey of Object.keys(rawSearch)) {
    const path = getObjectSearchRawKeyPath(parentKey, rawKey);

    if (!path) {
      continue;
    }

    const pathKey = createObjectSearchPathKey(path);
    const current = paths.get(pathKey);

    if (!current) {
      paths.set(pathKey, { path, rawKeys: new Set([rawKey]) });
      continue;
    }

    current.rawKeys.add(rawKey);

    if (current.rawKeys.size > 1) {
      throw new UrlKitError(
        'invalid-search',
        'Object search parameter keys resolve to the same object path.',
        {
          path: [...parentPath, ...current.path],
        },
      );
    }
  }
}
