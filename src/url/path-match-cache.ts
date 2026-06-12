import match from '@cookbook/pathkit/match';
import type { DecodePathParam } from '../contracts.js';
import type { ResolvedUrlPathMatchOptions } from './default-url-path-match-options.js';

type PathKitMatcher = ReturnType<typeof match>;

export interface PathMatchCache {
  get(options: ResolvedUrlPathMatchOptions): PathKitMatcher;
}

export function createPathMatchCache(pattern: string): PathMatchCache {
  const primitiveCache = new Map<string, PathKitMatcher>();
  const functionDecoderCache = new WeakMap<DecodePathParam, Map<string, PathKitMatcher>>();

  return Object.freeze({
    get(options: ResolvedUrlPathMatchOptions): PathKitMatcher {
      if (typeof options.decode === 'function') {
        return getFunctionDecoderMatcher(
          pattern,
          { ...options, decode: options.decode },
          functionDecoderCache,
        );
      }

      const key = createPrimitivePathMatchKey(options);
      const cached = primitiveCache.get(key);

      if (cached) {
        return cached;
      }

      const matcher = match(pattern, options);
      primitiveCache.set(key, matcher);

      return matcher;
    },
  });
}

export function createPrimitivePathMatchKey(options: ResolvedUrlPathMatchOptions): string {
  return `${options.trailing ? '1' : '0'}${options.sensitive ? '1' : '0'}${options.strict ? '1' : '0'}${
    options.end ? '1' : '0'
  }${options.wildcardFormat === 'array' ? '1' : '0'}${options.decode === true ? '1' : '0'}`;
}

export function createFunctionDecoderPathMatchKey(options: ResolvedUrlPathMatchOptions): string {
  return `${options.trailing ? '1' : '0'}${options.sensitive ? '1' : '0'}${options.strict ? '1' : '0'}${
    options.end ? '1' : '0'
  }${options.wildcardFormat === 'array' ? '1' : '0'}`;
}

function getFunctionDecoderMatcher(
  pattern: string,
  options: ResolvedUrlPathMatchOptions & { readonly decode: DecodePathParam },
  cache: WeakMap<DecodePathParam, Map<string, PathKitMatcher>>,
): PathKitMatcher {
  const key = createFunctionDecoderPathMatchKey(options);
  let decoderCache = cache.get(options.decode);

  if (!decoderCache) {
    decoderCache = new Map<string, PathKitMatcher>();
    cache.set(options.decode, decoderCache);
  }

  const cached = decoderCache.get(key);

  if (cached) {
    return cached;
  }

  const matcher = match(pattern, options);
  decoderCache.set(key, matcher);

  return matcher;
}
