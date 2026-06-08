import { describe, expect, it } from 'vitest';
import { getPathParamKind, type PathParamKind } from './path-param-kind.js';
import type { ParsedPathParamSegment } from './path-segment.js';

function expectType<Value>(_value: Value): void {}

describe('getPathParamKind', () => {
  it('maps supported constraints to URLKit path param kinds', () => {
    expect(getPathParamKind({ kind: 'param', name: 'id', constraint: 'int' })).toBe('int');
    expect(getPathParamKind({ kind: 'param', name: 'id', constraint: 'decimal' })).toBe('decimal');
    expect(getPathParamKind({ kind: 'param', name: 'id', constraint: 'range' })).toBe('decimal');
    expect(
      getPathParamKind({
        kind: 'param',
        name: 'slug',
        constraint: 'regex',
        constraintParams: '[a-z]+',
      }),
    ).toBe('regex');
  });

  it('infers from the highest weighted constraint in a chain', () => {
    expect(
      getPathParamKind({
        kind: 'param',
        name: 'id',
        constraints: [
          { type: 'regex', params: '\\d' },
          { type: 'min', params: '1' },
        ],
      }),
    ).toBe('decimal');

    expect(
      getPathParamKind({
        kind: 'param',
        name: 'id',
        constraints: [
          { type: 'min', params: '1' },
          { type: 'int', params: '' },
          { type: 'decimal', params: '' },
        ],
      }),
    ).toBe('int');
  });

  it('treats standalone min, max, and range constraints as decimal numbers', () => {
    expect(getPathParamKind({ kind: 'param', name: 'id', constraint: 'min' })).toBe('decimal');
    expect(getPathParamKind({ kind: 'param', name: 'id', constraint: 'max' })).toBe('decimal');
    expect(getPathParamKind({ kind: 'param', name: 'id', constraint: 'range' })).toBe('decimal');
  });

  it('defaults unknown, absent, and string-only constraints to string params', () => {
    expect(getPathParamKind({ kind: 'param', name: 'slug' })).toBe('string');
    expect(getPathParamKind({ kind: 'param', name: 'slug', constraint: 'uuid' })).toBe('string');
    expect(
      getPathParamKind({
        kind: 'param',
        name: 'slug',
        constraints: [
          { type: 'minlength', params: '3' },
          { type: 'maxlength', params: '50' },
        ],
      }),
    ).toBe('string');
  });

  it('keeps the public path param kind union narrow', () => {
    const kind: PathParamKind = getPathParamKind({ kind: 'param', name: 'id', constraint: 'int' });
    const segment: ParsedPathParamSegment = { kind: 'param', name: 'slug' };

    expectType<'string' | 'int' | 'decimal' | 'range' | 'regex'>(kind);
    expect(getPathParamKind(segment)).toBe('string');
  });
});
