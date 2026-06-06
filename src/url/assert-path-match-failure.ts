import { getConstraint } from '@cookbook/pathkit/constraints';
import { UrlKitError } from '../errors/url-kit-error.js';
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
      console.log('ERROR', segment);
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
  if (!pathname) {
    return Object.freeze([]);
  }

  const normalized = pathname.startsWith('/') ? pathname.slice(1) : pathname;

  if (!normalized) {
    return Object.freeze([]);
  }

  return Object.freeze(normalized.split('/'));
}

function isValidPathParamSegment(
  segment: Extract<ParsedPathSegment, { readonly kind: 'param' }>,
  value: string,
): boolean {
  if (!value || !segment.constraint) {
    return false;
  }

  const constraint = getConstraint(segment.constraint);

  if (!constraint) {
    return false;
  }

  try {
    constraint(segment.name, value, segment.constraintParams ?? '');
    console.log(constraint, segment, value);
    return true;
  } catch {
    return false;
  }
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
