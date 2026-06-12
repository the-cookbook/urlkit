import type { DecodePathParam, UrlPathWildcardFormat } from '../contracts.js';

export interface ResolvedUrlPathMatchOptions {
  readonly delimiter: '/';
  readonly trailing: boolean;
  readonly sensitive: boolean;
  readonly strict: boolean;
  readonly end: boolean;
  readonly wildcardFormat: UrlPathWildcardFormat;
  readonly decode: boolean | DecodePathParam;
}

export const defaultUrlPathMatchOptions = Object.freeze({
  delimiter: '/',
  trailing: true,
  sensitive: false,
  strict: false,
  end: true,
  wildcardFormat: 'string',
  decode: false,
} satisfies ResolvedUrlPathMatchOptions);
