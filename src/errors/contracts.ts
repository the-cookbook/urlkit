export type UrlKitErrorCode =
  | 'invalid-url'
  | 'path-mismatch'
  | 'missing-param'
  | 'invalid-param'
  | 'missing-search'
  | 'invalid-search'
  | 'invalid-hash'
  | 'invalid-descriptor';

export interface UrlKitErrorOptions {
  readonly path?: readonly string[];
  readonly cause?: unknown;
}
