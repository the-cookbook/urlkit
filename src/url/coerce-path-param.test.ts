import { describe, expect, it } from 'vitest';
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

  it('coerces int, decimal, and range params in parsed mode', () => {
    expect(coercePathParam(param('int'), '42', 'parsed')).toBe(42);
    expect(coercePathParam(param('decimal'), '4.2', 'parsed')).toBe(4.2);
    expect(coercePathParam(param('range'), '4.2', 'parsed')).toBe(4.2);
  });

  it('keeps string and regex params as strings in parsed mode', () => {
    expect(coercePathParam(param(), 'abc', 'parsed')).toBe('abc');
    expect(coercePathParam(param('regex'), 'post-1', 'parsed')).toBe('post-1');
  });
});
