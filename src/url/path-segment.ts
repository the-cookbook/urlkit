import type { LiteralSegment, ParameterSegment, Constraint } from '@cookbook/pathkit';

export type ParsedPathLiteralSegment = LiteralSegment;

export type ParsedPathParamConstraint = Constraint;

export type ParsedPathParamSegment = Pick<ParameterSegment, 'type' | 'name'> &
  Partial<Omit<ParameterSegment, 'type' | 'name'>>;

export type ParsedPathSegment = ParsedPathLiteralSegment | ParsedPathParamSegment;
