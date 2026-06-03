export interface ParsedPathLiteralSegment {
  readonly kind: 'literal';
  readonly value: string;
}

export interface ParsedPathParamSegment {
  readonly kind: 'param';
  readonly name: string;
  readonly constraint?: string;
  readonly constraintParams?: string;
}

export type ParsedPathSegment = ParsedPathLiteralSegment | ParsedPathParamSegment;
