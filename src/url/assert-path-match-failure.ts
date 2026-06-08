import { getConstraint } from '@cookbook/pathkit/constraints';
import { UrlKitError } from '../errors/url-kit-error.js';
import { getPathParamConstraints } from './path-param-constraints.js';
import type { ParsedPathSegment } from './path-segment.js';

interface PathParamValidationFailure {
  readonly message: string;
  readonly cause?: unknown;
}

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

    const validationFailure = getPathParamValidationFailure(segment, pathnameSegment);

    if (validationFailure) {
      throw new UrlKitError('invalid-param', validationFailure.message, {
        path: ['params', segment.name],
        ...(validationFailure.cause === undefined ? {} : { cause: validationFailure.cause }),
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

function getPathParamValidationFailure(
  segment: Extract<ParsedPathSegment, { readonly kind: 'param' }>,
  value: string,
): PathParamValidationFailure | undefined {
  if (!value) {
    return {
      message: `Path parameter "${segment.name}" is invalid.`,
    };
  }

  for (const pathConstraint of getPathParamConstraints(segment)) {
    const constraint = getConstraint(pathConstraint.type);

    if (!constraint) {
      return {
        message: `Path constraint "${pathConstraint.type}" is not registered.`,
      };
    }

    try {
      constraint(segment.name, value, pathConstraint.params);
    } catch (error) {
      const causeMessage = getCauseMessage(error);

      return {
        message: causeMessage
          ? `Path parameter "${segment.name}" is invalid: ${causeMessage}`
          : `Path parameter "${segment.name}" is invalid.`,
        cause: error,
      };
    }
  }

  return undefined;
}

function getCauseMessage(error: unknown): string | undefined {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === 'string' && error) {
    return error;
  }

  return undefined;
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
