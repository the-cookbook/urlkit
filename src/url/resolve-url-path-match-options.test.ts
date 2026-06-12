import { describe, expect, it } from 'vitest';
import { defaultUrlPathMatchOptions } from './default-url-path-match-options.js';
import { resolveUrlPathMatchOptions } from './resolve-url-path-match-options.js';

describe('resolveUrlPathMatchOptions', () => {
  it('uses URLKit PathKit-compatible defaults', () => {
    expect(resolveUrlPathMatchOptions()).toEqual(defaultUrlPathMatchOptions);
  });

  it('lets method options override contract options', () => {
    expect(
      resolveUrlPathMatchOptions(
        { end: false, sensitive: true, wildcardFormat: 'array' },
        { end: true, decode: true },
      ),
    ).toEqual({
      delimiter: '/',
      trailing: true,
      sensitive: true,
      strict: false,
      end: true,
      wildcardFormat: 'array',
      decode: true,
    });
  });
});
