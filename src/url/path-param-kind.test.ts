import { describe, expect, it } from 'vitest';
import { getPathParamKind, type PathParamKind } from './path-param-kind.js';
import type { ParsedPathParamSegment } from './path-segment.js';

function expectType<Value>(_value: Value): void {}

describe('getPathParamKind', () => {
  it('maps supported constraints to URLKit path param kinds', () => {
    expect(getPathParamKind({ kind: 'param', name: 'id', constraint: 'int' })).toBe('int');
    expect(getPathParamKind({ kind: 'param', name: 'id', constraint: 'number' })).toBe('number');
    expect(
      getPathParamKind({
        kind: 'param',
        name: 'slug',
        constraint: 'regex',
        constraintParams: '[a-z]+',
      }),
    ).toBe('regex');
  });

  it('defaults unknown or absent constraints to string params', () => {
    expect(getPathParamKind({ kind: 'param', name: 'slug' })).toBe('string');
    expect(getPathParamKind({ kind: 'param', name: 'slug', constraint: 'uuid' })).toBe('string');
  });

  it('keeps the public path param kind union narrow', () => {
    const kind: PathParamKind = getPathParamKind({ kind: 'param', name: 'id', constraint: 'int' });
    const segment: ParsedPathParamSegment = { kind: 'param', name: 'slug' };

    expectType<'string' | 'int' | 'number' | 'regex'>(kind);
    expect(getPathParamKind(segment)).toBe('string');
  });
});
