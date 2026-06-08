import { createConstraint } from '@cookbook/pathkit/constraints';
import { describe, expect, it } from 'vitest';
import { registerPathConstraint } from './path-constraints.js';
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
        { kind: 'param', name: 'amount', constraint: 'decimal' },
      ]),
    ).toThrow(expect.objectContaining({ code: 'invalid-param', path: ['params', 'amount'] }));

    expect(() =>
      assertPathMatchFailure('/posts/{slug:regex([a-z0-9-]+)}', '/posts/Post', [
        { kind: 'literal', value: 'posts' },
        { kind: 'param', name: 'slug', constraint: 'regex', constraintParams: '[a-z0-9-]+' },
      ]),
    ).toThrow(expect.objectContaining({ code: 'invalid-param', path: ['params', 'slug'] }));
  });

  it('preserves PathKit constraint validation errors as the UrlKitError cause', () => {
    const slug = createConstraint({
      parse(paramName, value) {
        if (!/^[a-z0-9-]+$/.test(String(value))) {
          throw new Error(`Path parameter "${paramName}" must be lowercase kebab-case.`);
        }
      },
      verify(_paramName, params) {
        if (params.trim()) {
          throw new Error('Slug constraint does not accept arguments.');
        }
      },
      toRegExp() {
        return '[a-z0-9-]+';
      },
    });

    registerPathConstraint('urlkitdetailedslug', slug);

    try {
      assertPathMatchFailure('/posts/{slug:urlkitdetailedslug}', '/posts/Post', [
        { kind: 'literal', value: 'posts' },
        { kind: 'param', name: 'slug', constraint: 'urlkitdetailedslug' },
      ]);
    } catch (error) {
      expect(error).toEqual(
        expect.objectContaining({
          code: 'invalid-param',
          message: expect.stringContaining('must be lowercase kebab-case'),
          path: ['params', 'slug'],
          cause: expect.objectContaining({
            message: 'Path parameter "slug" must be lowercase kebab-case.',
          }),
        }),
      );
      return;
    }

    throw new Error('Expected invalid-param.');
  });

  it('keeps PathKit as the source of truth for chained path constraint failures', () => {
    expect(() =>
      assertPathMatchFailure('/users/{id:int:min(1)}', '/users/1.5', [
        { kind: 'literal', value: 'users' },
        {
          kind: 'param',
          name: 'id',
          constraint: 'int',
          constraints: [
            { type: 'int', params: '' },
            { type: 'min', params: '1' },
          ],
        },
      ]),
    ).toThrow(expect.objectContaining({ code: 'path-mismatch', path: ['pathname'] }));
  });
});
