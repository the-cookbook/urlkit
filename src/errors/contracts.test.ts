import { describe, expect, it, expectTypeOf } from 'vitest';
import type { UrlKitErrorCode, UrlKitErrorOptions } from './contracts.js';

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
    expectTypeOf<readonly string[] | undefined>(options.path);
  });
});
