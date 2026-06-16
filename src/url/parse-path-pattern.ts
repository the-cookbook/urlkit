import tokenize from '@cookbook/pathkit/tokenize';
import type { LiteralSegment, ParameterSegment, RouteSegment } from '@cookbook/pathkit';
import { UrlKitError } from '../errors/url-kit-error.js';
import type { ParsedPathSegment } from './path-segment.js';

export function parsePathPattern(pattern: string): readonly ParsedPathSegment[] {
  try {
    return toParsedPathSegments(tokenize(pattern));
  } catch (error) {
    if (error instanceof UrlKitError) {
      throw error;
    }

    const causeMessage = error instanceof Error && error.message ? `: ${error.message}` : '';

    throw new UrlKitError('invalid-descriptor', `Path pattern is invalid${causeMessage}.`, {
      path: ['path'],
      cause: error,
    });
  }
}

function toParsedPathSegments(tokens: readonly RouteSegment[]): readonly ParsedPathSegment[] {
  const segments: ParsedPathSegment[] = [];

  for (const token of tokens) {
    if (token.type === 'literal') {
      appendLiteralSegments(segments, token.value);
      continue;
    }

    segments.push(toParsedParamSegment(token));
  }

  return Object.freeze(segments.map((segment) => Object.freeze(segment)));
}

function appendLiteralSegments(
  segments: ParsedPathSegment[],
  value: LiteralSegment['value'],
): void {
  if (!value) {
    return;
  }

  for (const segment of value.split('/')) {
    if (!segment) {
      continue;
    }

    segments.push(Object.freeze({ type: 'literal', value: segment }));
  }
}

function toParsedParamSegment(token: ParameterSegment): ParsedPathSegment {
  const constraints = Object.freeze(
    token.constraints.map((constraint) =>
      Object.freeze({
        type: constraint.type,
        params: constraint.params,
      }),
    ),
  );

  return Object.freeze({
    type: 'parameter',
    name: token.name,
    ...(token.optional ? { optional: true as const } : {}),
    ...(token.wildcard ? { wildcard: true as const } : {}),
    ...(constraints.length ? { constraints } : {}),
  });
}
