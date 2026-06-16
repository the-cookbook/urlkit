import { describe, expect, it } from 'vitest';
import { parsePathPattern } from './parse-path-pattern.js';

describe('parsePathPattern', () => {
  it('parses static and parameter path segments', () => {
    expect(parsePathPattern('/teams/{teamId}/users/{userId:int}')).toEqual([
      { type: 'literal', value: 'teams' },
      { type: 'parameter', name: 'teamId' },
      { type: 'literal', value: 'users' },
      {
        type: 'parameter',
        name: 'userId',
        constraints: [{ type: 'int', params: '' }],
      },
    ]);
  });

  it('parses regex constraints without splitting regex internals', () => {
    expect(parsePathPattern('/posts/{slug:regex([a-z0-9-]+)}')).toEqual([
      { type: 'literal', value: 'posts' },
      {
        type: 'parameter',
        name: 'slug',
        constraints: [{ type: 'regex', params: '[a-z0-9-]+' }],
      },
    ]);
  });

  it('preserves chained path constraints from PathKit', () => {
    expect(parsePathPattern('/users/{id:min(1):int:decimal}')).toEqual([
      { type: 'literal', value: 'users' },
      {
        type: 'parameter',
        name: 'id',
        constraints: [
          { type: 'min', params: '1' },
          { type: 'int', params: '' },
          { type: 'decimal', params: '' },
        ],
      },
    ]);

    expect(parsePathPattern('/users/{id:regex(\\d):min(1)}')).toEqual([
      { type: 'literal', value: 'users' },
      {
        type: 'parameter',
        name: 'id',
        constraints: [
          { type: 'regex', params: '\\d' },
          { type: 'min', params: '1' },
        ],
      },
    ]);
  });

  it('preserves standalone numeric and string constraints', () => {
    expect(parsePathPattern('/users/{id:min(1)}')).toEqual([
      { type: 'literal', value: 'users' },
      {
        type: 'parameter',
        name: 'id',
        constraints: [{ type: 'min', params: '1' }],
      },
    ]);

    expect(parsePathPattern('/articles/{slug:minlength(3):maxlength(50)}')).toEqual([
      { type: 'literal', value: 'articles' },
      {
        type: 'parameter',
        name: 'slug',
        constraints: [
          { type: 'minlength', params: '3' },
          { type: 'maxlength', params: '50' },
        ],
      },
    ]);
  });

  it('preserves optional and wildcard metadata from PathKit', () => {
    expect(parsePathPattern('/users/{id:min(1)?}')).toEqual([
      { type: 'literal', value: 'users' },
      {
        type: 'parameter',
        name: 'id',
        optional: true,
        constraints: [{ type: 'min', params: '1' }],
      },
    ]);

    expect(parsePathPattern('/files/{*path?}')).toEqual([
      { type: 'literal', value: 'files' },
      {
        type: 'parameter',
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
