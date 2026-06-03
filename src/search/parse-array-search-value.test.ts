import { describe, expect, it } from 'vitest';
import { array } from '../schema/array.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { parseArraySearchValue } from './parse-array-search-value.js';

const context = { kind: 'search' as const, path: ['tags'], errorCode: 'invalid-search' as const };

describe('parseArraySearchValue', () => {
  it('parses repeated and single raw search values as arrays', () => {
    expect(parseArraySearchValue(array(string()), ['react', 'router'], context)).toEqual([
      'react',
      'router',
    ]);
    expect(parseArraySearchValue(array(string()), 'react', context)).toEqual(['react']);
  });

  it('splits comma-separated values when requested', () => {
    expect(
      parseArraySearchValue(array(string()), 'react,router', context, { arrayFormat: 'comma' }),
    ).toEqual(['react', 'router']);
  });

  it('applies defaulted and optional absence behavior', () => {
    expect(
      parseArraySearchValue(array(string()).optional() as never, undefined, context),
    ).toBeUndefined();
    expect(
      parseArraySearchValue(array(int()).default([1, 2]) as never, undefined, context),
    ).toEqual([1, 2]);
  });

  it('throws missing-search for absent required arrays', () => {
    expect(() => parseArraySearchValue(array(string()), undefined, context)).toThrow(
      expect.objectContaining({ code: 'missing-search', path: ['tags'] }),
    );
  });

  it('validates every array element with the nested schema', () => {
    expect(parseArraySearchValue(array(int()), ['1', '2'], context)).toEqual([1, 2]);
    expect(() => parseArraySearchValue(array(int()), ['1', 'wrong'], context)).toThrow(
      expect.objectContaining({ code: 'invalid-search', path: ['tags'] }),
    );
  });
});
