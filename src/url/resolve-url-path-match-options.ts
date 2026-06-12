import type { UrlPathMatchOptions } from '../contracts.js';
import {
  defaultUrlPathMatchOptions,
  type ResolvedUrlPathMatchOptions,
} from './default-url-path-match-options.js';

export function resolveUrlPathMatchOptions(
  contractOptions?: UrlPathMatchOptions,
  callOptions?: UrlPathMatchOptions,
): ResolvedUrlPathMatchOptions {
  return {
    delimiter: '/',
    trailing:
      callOptions?.trailing ?? contractOptions?.trailing ?? defaultUrlPathMatchOptions.trailing,
    sensitive:
      callOptions?.sensitive ?? contractOptions?.sensitive ?? defaultUrlPathMatchOptions.sensitive,
    strict: callOptions?.strict ?? contractOptions?.strict ?? defaultUrlPathMatchOptions.strict,
    end: callOptions?.end ?? contractOptions?.end ?? defaultUrlPathMatchOptions.end,
    wildcardFormat:
      callOptions?.wildcardFormat ??
      contractOptions?.wildcardFormat ??
      defaultUrlPathMatchOptions.wildcardFormat,
    decode: callOptions?.decode ?? contractOptions?.decode ?? defaultUrlPathMatchOptions.decode,
  };
}
