import type {
  PathConstraintMap,
  SearchArrayFormat,
  UnknownSearchBehavior,
  UrlPathMatchOptions,
} from '../contracts.js';

export interface CreateRouteUrlContractOptions {
  readonly params?: 'raw' | 'parsed';
  readonly unknownSearch?: UnknownSearchBehavior;
  readonly arrayFormat?: SearchArrayFormat;
  readonly pathConstraints?: PathConstraintMap;
  readonly pathMatch?: UrlPathMatchOptions;
}
