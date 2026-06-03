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
  });

  it('coerces int and number params in parsed mode', () => {
    expect(coercePathParam(param('int'), '42', 'parsed')).toBe(42);
    expect(coercePathParam(param('number'), '4.2', 'parsed')).toBe(4.2);
  });

  it('keeps string and regex params as strings in parsed mode', () => {
    expect(coercePathParam(param(), 'abc', 'parsed')).toBe('abc');
    expect(coercePathParam(param('regex'), 'post-1', 'parsed')).toBe('post-1');
  });
});
