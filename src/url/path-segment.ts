export interface ParsedPathLiteralSegment {
  readonly kind: 'literal';
  readonly value: string;
}

export interface ParsedPathParamConstraint {
  readonly type: string;
  readonly params: string;
}

export interface ParsedPathParamSegment {
  readonly kind: 'param';
  readonly name: string;
  readonly optional?: true;
  readonly wildcard?: true;
  readonly constraints?: readonly ParsedPathParamConstraint[];

  /**
   * Compatibility aliases for the first constraint in the PathKit chain.
   */
  readonly constraint?: string;
  readonly constraintParams?: string;
}

export type ParsedPathSegment = ParsedPathLiteralSegment | ParsedPathParamSegment;
