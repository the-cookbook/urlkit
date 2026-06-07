import { describe, expect, it, expectTypeOf } from 'vitest';
import type {
  ParsedPathLiteralSegment,
  ParsedPathParamSegment,
  ParsedPathSegment,
} from './path-segment.js';

describe('path segment contracts', () => {
  it('models parsed literal and param path segments as a discriminated union', () => {
    const literal: ParsedPathLiteralSegment = { kind: 'literal', value: 'users' };
    const param: ParsedPathParamSegment = { kind: 'param', name: 'id', constraint: 'int' };
    const segments: readonly ParsedPathSegment[] = [literal, param];

    expect(segments).toEqual([
      { kind: 'literal', value: 'users' },
      { kind: 'param', name: 'id', constraint: 'int' },
    ]);
    expectTypeOf<ParsedPathSegment>(literal);
    expectTypeOf<ParsedPathSegment>(param);
  });
});
