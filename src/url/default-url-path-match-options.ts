import type { UrlPathMatchOptions } from '../contracts.js';

export interface ResolvedUrlPathMatchOptions extends Required<UrlPathMatchOptions> {
  readonly delimiter: '/';
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
