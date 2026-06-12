import compile from '@cookbook/pathkit/compile';
import type { MatchedParam } from '@cookbook/pathkit';
import type { UrlPathMatchOptions } from '../contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import { coercePathParam } from './coerce-path-param.js';
import { normalizePathBuildParams } from './normalize-path-build-params.js';
import { parsePathPattern } from './parse-path-pattern.js';
import { registerPathConstraints } from './path-constraints.js';
import { createPathMatchCache } from './path-match-cache.js';
import { resolveUrlPathMatchOptions } from './resolve-url-path-match-options.js';
import { mapPathKitMatchError } from './map-pathkit-error.js';
import { defaultUrlPathMatchOptions } from './default-url-path-match-options.js';
import type { CompiledPath, CompilePathOptions, PathMatchResult } from './contracts.js';

export function compilePath<Pattern extends string>(
  pattern: Pattern,
  options: CompilePathOptions = {},
): CompiledPath<Pattern> {
  if (options.pathConstraints) {
    registerPathConstraints(options.pathConstraints);
  }

  const paramsMode = options.params ?? 'parsed';
  const { segments, pathParamNames, matcherCache, builder } = compilePathPattern(pattern);

  return Object.freeze({
    pattern,
    parsePathname(pathname: string, matchOptions?: UrlPathMatchOptions) {
      const result = matchPathname(pathname, {
        ...matchOptions,
        strict: matchOptions?.strict ?? true,
      });

      if (!result.match) {
        throw new UrlKitError('path-mismatch', 'Pathname does not match the URL pattern.', {
          path: ['pathname'],
        });
      }

      return result.params as never;
    },
    matchPathname(pathname: string, matchOptions?: UrlPathMatchOptions) {
      return matchPathname(pathname, matchOptions) as never;
    },
    buildPath(params?: unknown) {
      try {
        return builder(normalizePathBuildParams(params));
      } catch (error) {
        throw mapBuildPathError(error);
      }
    },
  });

  function matchPathname(
    pathname: string,
    matchOptions?: UrlPathMatchOptions,
  ): PathMatchResult<Record<string, string | number | readonly (string | number)[]>> {
    try {
      const matcher = matcherCache.get(resolveUrlPathMatchOptions(undefined, matchOptions));
      const result = matcher(pathname);

      if (!result.match || !result.params) {
        return Object.freeze({
          match: false,
          params: null,
        });
      }

      return Object.freeze({
        match: true,
        path: result.path,
        params: Object.freeze(coercePathParams(result.params, segments, paramsMode)),
      });
    } catch (error) {
      throw mapPathKitMatchError(error, pathParamNames);
    }
  }
}

function coercePathParams(
  matchedParams: MatchedParam,
  segments: ReturnType<typeof parsePathPattern>,
  paramsMode: 'raw' | 'parsed',
): Record<string, string | number | readonly (string | number)[]> {
  const params: Record<string, string | number | readonly (string | number)[]> = {};

  for (const segment of segments) {
    if (segment.kind !== 'param') {
      continue;
    }

    const value = matchedParams[segment.name];

    if (value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      if (!segment.wildcard) {
        throw new UrlKitError(
          'invalid-param',
          `Path parameter "${segment.name}" returned an array for a non-wildcard segment.`,
          { path: ['params', segment.name] },
        );
      }

      params[segment.name] = Object.freeze(
        value.map((item) => coercePathParam(segment, item, paramsMode)),
      );
      continue;
    }

    if (typeof value !== 'string') {
      continue;
    }

    params[segment.name] = coercePathParam(segment, value, paramsMode);
  }

  return params;
}

function mapBuildPathError(error: unknown): UrlKitError {
  if (error instanceof UrlKitError) {
    return error;
  }

  const message = error instanceof Error ? error.message : 'Failed to build pathname.';
  const missingParamMatch = /Missing required parameter: ([^\s]+)/.exec(message);

  if (missingParamMatch?.[1]) {
    return new UrlKitError(
      'missing-param',
      `Path parameter "${missingParamMatch[1]}" is required.`,
      {
        path: ['params', missingParamMatch[1]],
        cause: error,
      },
    );
  }

  return new UrlKitError('invalid-param', message, {
    path: ['params'],
    cause: error,
  });
}

function compilePathPattern<Pattern extends string>(
  pattern: Pattern,
): {
  readonly segments: ReturnType<typeof parsePathPattern>;
  readonly pathParamNames: readonly string[];
  readonly matcherCache: ReturnType<typeof createPathMatchCache>;
  readonly builder: ReturnType<typeof compile>;
} {
  try {
    const segments = parsePathPattern(pattern);

    return Object.freeze({
      segments,
      pathParamNames: getPathParamNames(segments),
      matcherCache: createValidatedPathMatchCache(pattern),
      builder: compile(pattern),
    });
  } catch (error) {
    if (error instanceof UrlKitError) {
      throw error;
    }

    throw new UrlKitError('invalid-descriptor', 'Path pattern is invalid.', {
      path: ['path'],
      cause: error,
    });
  }
}

function getPathParamNames(segments: ReturnType<typeof parsePathPattern>): readonly string[] {
  return Object.freeze(
    segments.flatMap((segment) => (segment.kind === 'param' ? [segment.name] : [])),
  );
}

function createValidatedPathMatchCache(pattern: string): ReturnType<typeof createPathMatchCache> {
  const matcherCache = createPathMatchCache(pattern);
  matcherCache.get(defaultUrlPathMatchOptions);

  return matcherCache;
}
