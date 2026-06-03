import { describe, expect, it } from 'vitest';
import type { UrlKitErrorCode, UrlKitErrorOptions } from './contracts.js';

function expectType<Value>(_value: Value): void {}

describe('error contracts', () => {
  it('keeps public error codes and options structured', () => {
    const codes: readonly UrlKitErrorCode[] = [
      'invalid-url',
      'path-mismatch',
      'missing-param',
      'invalid-param',
      'missing-search',
      'invalid-search',
      'invalid-hash',
      'invalid-descriptor',
    ];
    const options: UrlKitErrorOptions = { path: ['search', 'q'], cause: new Error('cause') };

    expect(codes).toHaveLength(8);
    expect(options.path).toEqual(['search', 'q']);
    expectType<readonly string[] | undefined>(options.path);
  });
});
