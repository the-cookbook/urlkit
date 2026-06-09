import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { coercePathParam } from './coerce-path-param.js';
import type { ParsedPathParamSegment } from './path-segment.js';

const param = (constraint?: string): ParsedPathParamSegment => ({
  kind: 'param',
  name: 'id',
  ...(constraint ? { constraint } : {}),
});

describe('coercePathParam', () => {
  it('keeps raw params as strings in raw mode', () => {
    expect(coercePathParam(param('int'), '42', 'raw')).toBe('42');
    expect(coercePathParam(param('decimal'), '4.2', 'raw')).toBe('4.2');
  });

  it('coerces int, decimal, range, min, and max params in parsed mode', () => {
    expect(coercePathParam(param('int'), '42', 'parsed')).toBe(42);
    expect(coercePathParam(param('decimal'), '4.2', 'parsed')).toBe(4.2);
    expect(coercePathParam(param('range'), '4.2', 'parsed')).toBe(4.2);
    expect(coercePathParam(param('min'), '4.2', 'parsed')).toBe(4.2);
    expect(coercePathParam(param('max'), '4.2', 'parsed')).toBe(4.2);
  });

  it('accepts negative int and decimal values when parsed', () => {
    expect(coercePathParam(param('int'), '-1', 'parsed')).toBe(-1);
    expect(coercePathParam(param('decimal'), '-9.99', 'parsed')).toBe(-9.99);
    expect(coercePathParam(param('min'), '-5', 'parsed')).toBe(-5);
  });

  it('coerces based on chained constraint weight', () => {
    expect(
      coercePathParam(
        {
          kind: 'param',
          name: 'id',
          constraints: [
            { type: 'regex', params: '/\\d/' },
            { type: 'min', params: '1' },
          ],
        },
        '2',
        'parsed',
      ),
    ).toBe(2);

    expect(
      coercePathParam(
        {
          kind: 'param',
          name: 'id',
          constraints: [
            { type: 'decimal', params: '' },
            { type: 'int', params: '' },
          ],
        },
        '2',
        'parsed',
      ),
    ).toBe(2);
  });

  it('throws for invalid numeric values', () => {
    expect(() => coercePathParam(param('int'), '1.5', 'parsed')).toThrow(UrlKitError);
    expect(() => coercePathParam(param('decimal'), 'abc', 'parsed')).toThrow(UrlKitError);
  });

  it('keeps string and regex params as strings in parsed mode', () => {
    expect(coercePathParam(param(), 'abc', 'parsed')).toBe('abc');
    expect(coercePathParam(param('regex'), 'post-1', 'parsed')).toBe('post-1');
    expect(coercePathParam(param('uuid'), '7d444840-9dc0-11d1-b245-5ffdce74fad2', 'parsed')).toBe(
      '7d444840-9dc0-11d1-b245-5ffdce74fad2',
    );
  });
});
