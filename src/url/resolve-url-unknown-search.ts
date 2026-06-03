import type { UnknownSearchBehavior, UnknownSearchParams } from '../contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import type { RawSearchParams } from '../search/contracts.js';
import { copyRawSearchParams } from '../search/copy-raw-search-params.js';

export function resolveUrlUnknownSearch(
  rawSearch: RawSearchParams,
  behavior: UnknownSearchBehavior,
): UnknownSearchParams | undefined {
  const keys = Object.keys(rawSearch);

  if (!keys.length || behavior === 'strip') {
    return undefined;
  }

  if (behavior === 'error') {
    throw new UrlKitError('invalid-search', 'Unknown search parameter is not allowed.', {
      path: [keys[0]!],
    });
  }

  return copyRawSearchParams(rawSearch);
}
