import compile from '@cookbook/pathkit/compile';
import match from '@cookbook/pathkit/match';
import type { MatchedParam } from '@cookbook/pathkit';
import { UrlKitError } from '../errors/url-kit-error.js';
import { assertPathMatchFailure } from './assert-path-match-failure.js';
import { coercePathParam } from './coerce-path-param.js';
import { normalizePathBuildParams } from './normalize-path-build-params.js';
import { parsePathPattern } from './parse-path-pattern.js';
import { registerUrlKitPathConstraints } from './register-urlkit-path-constraints.js';
import type { CompiledPath, CompilePathOptions } from './contracts.js';

export function compilePath<Pattern extends string>(
  pattern: Pattern,
  options: CompilePathOptions = {},
): CompiledPath<Pattern> {
  registerUrlKitPathConstraints();

  const paramsMode = options.params ?? 'parsed';
  const { segments, matcher, builder } = compilePathPattern(pattern);

  return Object.freeze({
    pattern,
    parsePathname(pathname: string) {
      const result = matcher(pathname);

      if (!result.match || !result.params) {
        assertPathMatchFailure(pattern, pathname, segments);
      }

      return Object.freeze(coercePathParams(result.params, segments, paramsMode)) as never;
    },
    buildPath(params?: unknown) {
      try {
        return builder(normalizePathBuildParams(params));
      } catch (error) {
        throw mapBuildPathError(error);
      }
    },
  });
}

function coercePathParams(
  matchedParams: MatchedParam,
  segments: ReturnType<typeof parsePathPattern>,
  paramsMode: 'raw' | 'parsed',
): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  for (const segment of segments) {
    if (segment.kind !== 'param') {
      continue;
    }

    const value = matchedParams[segment.name];

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
  readonly matcher: ReturnType<typeof match>;
  readonly builder: ReturnType<typeof compile>;
} {
  try {
    return Object.freeze({
      segments: parsePathPattern(pattern),
      matcher: match(pattern),
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
