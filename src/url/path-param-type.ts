import { hasAnyPathParamConstraint, hasPathParamConstraint } from './path-param-constraints.js';
import type { ParsedPathParamSegment } from './path-segment.js';

export type PathParamType = 'string' | 'int' | 'decimal' | 'range' | 'regex';

const decimalConstraints = ['decimal', 'range', 'min', 'max'] as const;

export function getPathParamType(segment: ParsedPathParamSegment): PathParamType {
  if (hasPathParamConstraint(segment, 'int')) {
    return 'int';
  }

  if (hasAnyPathParamConstraint(segment, decimalConstraints)) {
    return 'decimal';
  }

  if (hasPathParamConstraint(segment, 'regex')) {
    return 'regex';
  }

  return 'string';
}

export function isNumericPathParamType(type: PathParamType): type is 'int' | 'decimal' | 'range' {
  return type === 'int' || type === 'decimal' || type === 'range';
}
