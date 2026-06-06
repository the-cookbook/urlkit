import { UrlKitError } from '../errors/url-kit-error.js';
import { getPathParamKind, isNumericPathParamKind } from './path-param-kind.js';
import type { ParsedPathParamSegment } from './path-segment.js';

export function coercePathParam(
  segment: ParsedPathParamSegment,
  value: string,
  paramsMode: 'raw' | 'parsed',
): string | number {
  if (paramsMode === 'raw') {
    return value;
  }

  const kind = getPathParamKind(segment);

  if (kind === 'int') {
    const parsed = Number(value);

    if (!Number.isInteger(parsed)) {
      throw new UrlKitError(
        'invalid-param',
        `Path parameter "${segment.name}" must be an integer.`,
        {
          path: ['params', segment.name],
        },
      );
    }

    return parsed;
  }

  if (isNumericPathParamKind(kind)) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
      throw new UrlKitError(
        'invalid-param',
        `Path parameter "${segment.name}" must be a finite decimal number.`,
        {
          path: ['params', segment.name],
        },
      );
    }

    return parsed;
  }

  return value;
}
