import type { ParsedPathParamSegment } from './path-segment.js';

export type PathParamKind = 'string' | 'int' | 'number' | 'regex';

export function getPathParamKind(segment: ParsedPathParamSegment): PathParamKind {
  switch (segment.constraint) {
    case 'int':
      return 'int';
    case 'number':
      return 'number';
    case 'regex':
      return 'regex';
    default:
      return 'string';
  }
}
