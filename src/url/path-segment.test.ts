import { describe, expect, it, expectTypeOf } from 'vitest';
import type {
  ParsedPathLiteralSegment,
  ParsedPathParamSegment,
  ParsedPathSegment,
} from './path-segment.js';

describe('path segment contracts', () => {
  it('models parsed literal and param path segments as a discriminated union', () => {
    const literal: ParsedPathLiteralSegment = { type: 'literal', value: 'users' };
    const param: ParsedPathParamSegment = {
      type: 'parameter',
      name: 'id',
      constraints: [{ type: 'int', params: '' }],
    };
    const segments: readonly ParsedPathSegment[] = [literal, param];

    expect(segments).toEqual([
      { type: 'literal', value: 'users' },
      {
        type: 'parameter',
        name: 'id',
        constraints: [{ type: 'int', params: '' }],
      },
    ]);
    expectTypeOf<ParsedPathSegment>(literal);
    expectTypeOf<ParsedPathSegment>({
      type: 'parameter',
      name: 'id',
      constraints: [{ type: 'int', params: '' }],
    });
  });
});
