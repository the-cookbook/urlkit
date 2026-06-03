import { describe, expect, it } from 'vitest';
import { parsePathPattern } from './parse-path-pattern.js';

describe('parsePathPattern', () => {
  it('parses static and parameter path segments', () => {
    expect(parsePathPattern('/teams/{teamId}/users/{userId:int}')).toEqual([
      { kind: 'literal', value: 'teams' },
      { kind: 'param', name: 'teamId' },
      { kind: 'literal', value: 'users' },
      { kind: 'param', name: 'userId', constraint: 'int' },
    ]);
  });

  it('parses regex constraints without splitting regex internals', () => {
    expect(parsePathPattern('/posts/{slug:regex([a-z0-9-]+)}')).toEqual([
      { kind: 'literal', value: 'posts' },
      { kind: 'param', name: 'slug', constraint: 'regex', constraintParams: '[a-z0-9-]+' },
    ]);
  });

  it('freezes parsed segment output', () => {
    const segments = parsePathPattern('/users/{id}');

    expect(Object.isFrozen(segments)).toBe(true);
    expect(Object.isFrozen(segments[0])).toBe(true);
  });
});
