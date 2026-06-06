import { describe, expect, it } from 'vitest';
import { assertPathMatchFailure } from './assert-path-match-failure.js';
import type { ParsedPathSegment } from './path-segment.js';

const segments = [
  { kind: 'literal', value: 'users' },
  { kind: 'param', name: 'id', constraint: 'int' },
] satisfies readonly ParsedPathSegment[];

describe('assertPathMatchFailure', () => {
  it('throws path-mismatch when segment counts differ', () => {
    expect(() => assertPathMatchFailure('/users/{id:int}', '/users/42/details', segments)).toThrow(
      expect.objectContaining({ code: 'path-mismatch', path: ['pathname'] }),
    );
  });

  it('throws path-mismatch when literal segments differ', () => {
    expect(() => assertPathMatchFailure('/users/{id:int}', '/posts/42', segments)).toThrow(
      expect.objectContaining({ code: 'path-mismatch', path: ['pathname'] }),
    );
  });

  it('throws invalid-param when a matching param segment fails its constraint', () => {
    expect(() => assertPathMatchFailure('/users/{id:int}', '/users/abc', segments)).toThrow(
      expect.objectContaining({ code: 'invalid-param', path: ['params', 'id'] }),
    );
  });

  it('validates range and regex param constraints while explaining PathKit failures', () => {
    expect(() =>
      assertPathMatchFailure('/prices/{amount:decimal}', '/prices/abc', [
        { kind: 'literal', value: 'prices' },
        { kind: 'param', name: 'amount', constraint: 'number' },
      ]),
    ).toThrow(expect.objectContaining({ code: 'invalid-param', path: ['params', 'amount'] }));

    expect(() =>
      assertPathMatchFailure('/posts/{slug:regex([a-z0-9-]+)}', '/posts/Post', [
        { kind: 'literal', value: 'posts' },
        { kind: 'param', name: 'slug', constraint: 'regex', constraintParams: '[a-z0-9-]+' },
      ]),
    ).toThrow(expect.objectContaining({ code: 'invalid-param', path: ['params', 'slug'] }));
  });
});
