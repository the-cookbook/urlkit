import { hasAnyPathParamConstraint, hasPathParamConstraint } from './path-param-constraints.js';
import type { ParsedPathParamSegment } from './path-segment.js';

export type PathParamKind = 'string' | 'int' | 'decimal' | 'range' | 'regex';

const decimalConstraints = ['decimal', 'range', 'min', 'max'] as const;

export function getPathParamKind(segment: ParsedPathParamSegment): PathParamKind {
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

export function isNumericPathParamKind(kind: PathParamKind): kind is 'int' | 'decimal' | 'range' {
  return kind === 'int' || kind === 'decimal' || kind === 'range';
}
