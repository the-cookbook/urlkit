import { describe, expect, it } from 'vitest';
import { parsePathPattern } from './parse-path-pattern.js';

describe('parsePathPattern', () => {
  it('parses static and parameter path segments', () => {
    expect(parsePathPattern('/teams/{teamId}/users/{userId:int}')).toEqual([
      { kind: 'literal', value: 'teams' },
      { kind: 'param', name: 'teamId' },
      { kind: 'literal', value: 'users' },
      {
        kind: 'param',
        name: 'userId',
        constraint: 'int',
        constraints: [{ type: 'int', params: '' }],
      },
    ]);
  });

  it('parses regex constraints without splitting regex internals', () => {
    expect(parsePathPattern('/posts/{slug:regex([a-z0-9-]+)}')).toEqual([
      { kind: 'literal', value: 'posts' },
      {
        kind: 'param',
        name: 'slug',
        constraint: 'regex',
        constraintParams: '[a-z0-9-]+',
        constraints: [{ type: 'regex', params: '[a-z0-9-]+' }],
      },
    ]);
  });

  it('preserves chained path constraints from PathKit', () => {
    expect(parsePathPattern('/users/{id:min(1):int:decimal}')).toEqual([
      { kind: 'literal', value: 'users' },
      {
        kind: 'param',
        name: 'id',
        constraint: 'min',
        constraintParams: '1',
        constraints: [
          { type: 'min', params: '1' },
          { type: 'int', params: '' },
          { type: 'decimal', params: '' },
        ],
      },
    ]);

    expect(parsePathPattern('/users/{id:regex(\\d):min(1)}')).toEqual([
      { kind: 'literal', value: 'users' },
      {
        kind: 'param',
        name: 'id',
        constraint: 'regex',
        constraintParams: '\\d',
        constraints: [
          { type: 'regex', params: '\\d' },
          { type: 'min', params: '1' },
        ],
      },
    ]);
  });

  it('preserves standalone numeric and string constraints', () => {
    expect(parsePathPattern('/users/{id:min(1)}')).toEqual([
      { kind: 'literal', value: 'users' },
      {
        kind: 'param',
        name: 'id',
        constraint: 'min',
        constraintParams: '1',
        constraints: [{ type: 'min', params: '1' }],
      },
    ]);

    expect(parsePathPattern('/articles/{slug:minlength(3):maxlength(50)}')).toEqual([
      { kind: 'literal', value: 'articles' },
      {
        kind: 'param',
        name: 'slug',
        constraint: 'minlength',
        constraintParams: '3',
        constraints: [
          { type: 'minlength', params: '3' },
          { type: 'maxlength', params: '50' },
        ],
      },
    ]);
  });

  it('preserves optional and wildcard metadata from PathKit', () => {
    expect(parsePathPattern('/users/{id:min(1)?}')).toEqual([
      { kind: 'literal', value: 'users' },
      {
        kind: 'param',
        name: 'id',
        optional: true,
        constraint: 'min',
        constraintParams: '1',
        constraints: [{ type: 'min', params: '1' }],
      },
    ]);

    expect(parsePathPattern('/files/{*path?}')).toEqual([
      { kind: 'literal', value: 'files' },
      {
        kind: 'param',
        name: 'path',
        optional: true,
        wildcard: true,
      },
    ]);
  });

  it('freezes parsed segment output', () => {
    const segments = parsePathPattern('/users/{id}');

    expect(Object.isFrozen(segments)).toBe(true);
    expect(Object.isFrozen(segments[0])).toBe(true);
  });
});
