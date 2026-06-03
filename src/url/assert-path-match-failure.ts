import { UrlKitError } from '../errors/url-kit-error.js';
import { getPathParamKind } from './path-param-kind.js';
import type { ParsedPathSegment } from './path-segment.js';

export function assertPathMatchFailure(
  pattern: string,
  pathname: string,
  segments: readonly ParsedPathSegment[],
): never {
  const pathnameSegments = splitPath(pathname);

  if (pathnameSegments.length !== segments.length) {
    throwPathMismatch(pattern, pathname);
  }

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const pathnameSegment = pathnameSegments[index];

    if (!segment || pathnameSegment === undefined) {
      throwPathMismatch(pattern, pathname);
    }

    if (segment.kind === 'literal') {
      if (segment.value !== pathnameSegment) {
        throwPathMismatch(pattern, pathname);
      }

      continue;
    }

    if (!isValidPathParamSegment(segment, pathnameSegment)) {
      throw new UrlKitError('invalid-param', `Path parameter "${segment.name}" is invalid.`, {
        path: ['params', segment.name],
      });
    }
  }

  throwPathMismatch(pattern, pathname);
}

function splitPath(pathname: string): readonly string[] {
  if (pathname === '') {
    return Object.freeze([]);
  }

  const normalized = pathname.startsWith('/') ? pathname.slice(1) : pathname;

  if (normalized === '') {
    return Object.freeze([]);
  }

  return Object.freeze(normalized.split('/'));
}

function isValidPathParamSegment(
  segment: Extract<ParsedPathSegment, { readonly kind: 'param' }>,
  value: string,
): boolean {
  if (value === '') {
    return false;
  }

  const kind = getPathParamKind(segment);

  if (kind === 'int') {
    return /^\d+$/.test(value);
  }

  if (kind === 'number') {
    return /^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value) && Number.isFinite(Number(value));
  }

  if (kind === 'regex') {
    const params = segment.constraintParams;

    if (!params) {
      return false;
    }

    return new RegExp(`^(?:${params})$`).test(value);
  }

  return true;
}

function throwPathMismatch(pattern: string, pathname: string): never {
  throw new UrlKitError(
    'path-mismatch',
    `Pathname "${pathname}" does not match pattern "${pattern}".`,
    {
      path: ['pathname'],
    },
  );
}
