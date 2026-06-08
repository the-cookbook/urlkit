import { describe, expect, it } from 'vitest';
import type {
  ParsedPathLiteralSegment,
  ParsedPathParamSegment,
  ParsedPathSegment,
} from './path-segment.js';

function expectType<Value>(_value: Value): void {}

describe('path segment contracts', () => {
  it('models parsed literal and param path segments as a discriminated union', () => {
    const literal: ParsedPathLiteralSegment = { kind: 'literal', value: 'users' };
    const param: ParsedPathParamSegment = { kind: 'param', name: 'id', constraint: 'int' };
    const segments: readonly ParsedPathSegment[] = [literal, param];

    expect(segments).toEqual([
      { kind: 'literal', value: 'users' },
      { kind: 'param', name: 'id', constraint: 'int' },
    ]);
    expectType<ParsedPathSegment>(literal);
    expectType<ParsedPathSegment>(param);
  });
});
