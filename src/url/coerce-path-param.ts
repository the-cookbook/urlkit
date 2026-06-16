import { UrlKitError } from '../errors/url-kit-error.js';
import { getPathParamType, isNumericPathParamType } from './path-param-type.js';
import type { ParsedPathParamSegment } from './path-segment.js';

export function coercePathParam(
  segment: ParsedPathParamSegment,
  value: string,
  paramsMode: 'raw' | 'parsed',
): string | number {
  if (paramsMode === 'raw') {
    return value;
  }

  const type = getPathParamType(segment);

  if (type === 'int') {
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

  if (isNumericPathParamType(type)) {
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
