import type { ParsedPathParamConstraint, ParsedPathParamSegment } from './path-segment.js';

export function getPathParamConstraints(
  segment: ParsedPathParamSegment,
): readonly ParsedPathParamConstraint[] {
  if (segment.constraints?.length) {
    return segment.constraints;
  }

  return [];
}

export function hasPathParamConstraint(segment: ParsedPathParamSegment, type: string): boolean {
  return getPathParamConstraints(segment).some((constraint) => constraint.type === type);
}

export function hasAnyPathParamConstraint(
  segment: ParsedPathParamSegment,
  types: readonly string[],
): boolean {
  return getPathParamConstraints(segment).some((constraint) => types.includes(constraint.type));
}
