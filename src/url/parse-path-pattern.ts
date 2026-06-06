import tokenize from '@cookbook/pathkit/tokenize';
import type { LiteralSegment, ParameterSegment, RouteSegment } from '@cookbook/pathkit';
import { UrlKitError } from '../errors/url-kit-error.js';
import type { ParsedPathSegment } from './path-segment.js';

export function parsePathPattern(pattern: string): readonly ParsedPathSegment[] {
  try {
    return Object.freeze(toParsedPathSegments(tokenize(pattern)));
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

  return segments.map((segment) => Object.freeze(segment));
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

    segments.push({ kind: 'literal', value: segment });
  }
}

function toParsedParamSegment(token: ParameterSegment): ParsedPathSegment {
  const constraint = token.constraints[0];

  return {
    kind: 'param',
    name: token.name,
    ...(constraint
      ? {
          constraint: constraint.type,
          ...(constraint.params ? { constraintParams: constraint.params } : {}),
        }
      : {}),
  };
}
