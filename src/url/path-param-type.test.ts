import { describe, expect, it } from 'vitest';
import { getPathParamType, type PathParamType } from './path-param-type.js';
import type { ParsedPathParamSegment } from './path-segment.js';

function expectType<Value>(_value: Value): void {}

describe('getPathParamType', () => {
  it('maps supported constraints to URLKit path param types', () => {
    expect(
      getPathParamType({
        type: 'parameter',
        name: 'id',
        constraints: [{ type: 'int', params: '' }],
      }),
    ).toBe('int');
    expect(
      getPathParamType({
        type: 'parameter',
        name: 'id',
        constraints: [{ type: 'decimal', params: '' }],
      }),
    ).toBe('decimal');
    expect(
      getPathParamType({
        type: 'parameter',
        name: 'id',
        constraints: [{ type: 'range', params: '' }],
      }),
    ).toBe('decimal');
    expect(
      getPathParamType({
        type: 'parameter',
        name: 'slug',
        constraints: [{ type: 'regex', params: '[a-z]+' }],
      }),
    ).toBe('regex');
  });

  it('infers from the highest weighted constraint in a chain', () => {
    expect(
      getPathParamType({
        type: 'parameter',
        name: 'id',
        constraints: [
          { type: 'regex', params: '/\\d/' },
          { type: 'min', params: '1' },
        ],
      }),
    ).toBe('decimal');

    expect(
      getPathParamType({
        type: 'parameter',
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
    expect(
      getPathParamType({
        type: 'parameter',
        name: 'id',
        constraints: [{ type: 'min', params: '' }],
      }),
    ).toBe('decimal');
    expect(
      getPathParamType({
        type: 'parameter',
        name: 'id',
        constraints: [{ type: 'max', params: '' }],
      }),
    ).toBe('decimal');
    expect(
      getPathParamType({
        type: 'parameter',
        name: 'id',
        constraints: [{ type: 'range', params: '' }],
      }),
    ).toBe('decimal');
  });

  it('defaults unknown, absent, and string-only constraints to string params', () => {
    expect(getPathParamType({ type: 'parameter', name: 'slug' })).toBe('string');
    expect(
      getPathParamType({
        type: 'parameter',
        name: 'slug',
        constraints: [{ type: 'uuid', params: '' }],
      }),
    ).toBe('string');
    expect(
      getPathParamType({
        type: 'parameter',
        name: 'slug',
        constraints: [
          { type: 'minlength', params: '3' },
          { type: 'maxlength', params: '50' },
        ],
      }),
    ).toBe('string');
  });

  it('keeps the public path param type union narrow', () => {
    const type: PathParamType = getPathParamType({
      type: 'parameter',
      name: 'id',
      constraints: [{ type: 'int', params: '' }],
    });
    const segment: ParsedPathParamSegment = { type: 'parameter', name: 'slug' };

    expectType<'string' | 'int' | 'decimal' | 'range' | 'regex'>(type);
    expect(getPathParamType(segment)).toBe('string');
  });
});
