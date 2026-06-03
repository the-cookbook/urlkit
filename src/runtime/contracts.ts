import type { PathConstraintMap, SearchArrayFormat, UnknownSearchBehavior } from '../contracts.js';

export interface CreateRouteUrlContractOptions {
  readonly params?: 'raw' | 'parsed';
  readonly unknownSearch?: UnknownSearchBehavior;
  readonly arrayFormat?: SearchArrayFormat;
  readonly pathConstraints?: PathConstraintMap;
}
