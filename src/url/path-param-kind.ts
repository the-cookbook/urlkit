import type { ParsedPathParamSegment } from './path-segment.js';

export type PathParamKind = 'string' | 'int' | 'decimal' | 'range' | 'regex';

export function getPathParamKind(segment: ParsedPathParamSegment): PathParamKind {
  switch (segment.constraint) {
    case 'int':
      return 'int';
    case 'decimal':
      return 'decimal';
    case 'range':
      return 'range';
    case 'regex':
      return 'regex';
    default:
      return 'string';
  }
}

export function isNumericPathParamKind(kind: PathParamKind): kind is 'int' | 'decimal' | 'range' {
  return kind === 'int' || kind === 'decimal' || kind === 'range';
}
