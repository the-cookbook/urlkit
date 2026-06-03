import { UrlKitError } from '../errors/url-kit-error.js';
import type { ParsedPathSegment } from './path-segment.js';

export function parsePathPattern(pattern: string): readonly ParsedPathSegment[] {
  if (pattern === '') {
    return Object.freeze([]);
  }

  const normalized = pattern.startsWith('/') ? pattern.slice(1) : pattern;

  if (normalized === '') {
    return Object.freeze([]);
  }

  return Object.freeze(
    normalized.split('/').map((segment, index) => parsePathSegment(segment, index)),
  );
}

function parsePathSegment(segment: string, index: number): ParsedPathSegment {
  if (!segment.startsWith('{') || !segment.endsWith('}')) {
    return Object.freeze({ kind: 'literal', value: segment });
  }

  const token = segment.slice(1, -1);
  const parsed = parseParamToken(token);

  if (!parsed.name) {
    throw new UrlKitError('invalid-descriptor', 'Path parameter name is required.', {
      path: ['path', String(index)],
    });
  }

  return Object.freeze({ kind: 'param', ...parsed });
}

function parseParamToken(token: string): {
  readonly name: string;
  readonly constraint?: string;
  readonly constraintParams?: string;
} {
  const colonIndex = token.indexOf(':');

  if (colonIndex === -1) {
    return { name: token };
  }

  const name = token.slice(0, colonIndex);
  const constraintToken = token.slice(colonIndex + 1);
  const paramsStart = constraintToken.indexOf('(');

  if (paramsStart === -1 || !constraintToken.endsWith(')')) {
    return { name, constraint: constraintToken };
  }

  return {
    name,
    constraint: constraintToken.slice(0, paramsStart),
    constraintParams: constraintToken.slice(paramsStart + 1, -1),
  };
}
