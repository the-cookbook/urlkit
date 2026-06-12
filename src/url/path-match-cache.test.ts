import { describe, expect, it } from 'vitest';
import { defaultUrlPathMatchOptions } from './default-url-path-match-options.js';
import {
  createFunctionDecoderPathMatchKey,
  createPathMatchCache,
  createPrimitivePathMatchKey,
} from './path-match-cache.js';

const replaceDash = (value: string): string => value.replaceAll('-', ' ');
const replaceUnderscore = (value: string): string => value.replaceAll('_', ' ');

describe('path match cache', () => {
  it('creates compact primitive option keys', () => {
    expect(createPrimitivePathMatchKey(defaultUrlPathMatchOptions)).toBe('100100');
    expect(
      createPrimitivePathMatchKey({
        ...defaultUrlPathMatchOptions,
        sensitive: true,
        wildcardFormat: 'array',
        decode: true,
      }),
    ).toBe('110111');
  });

  it('reuses matchers for the same primitive options', () => {
    const cache = createPathMatchCache('/users/{id}');

    expect(cache.get(defaultUrlPathMatchOptions)).toBe(cache.get(defaultUrlPathMatchOptions));
    expect(cache.get(defaultUrlPathMatchOptions)).not.toBe(
      cache.get({ ...defaultUrlPathMatchOptions, sensitive: true }),
    );
  });

  it('caches custom decoder matchers by function identity', () => {
    const cache = createPathMatchCache('/hello/{name}');
    const first = { ...defaultUrlPathMatchOptions, decode: replaceDash };
    const second = { ...defaultUrlPathMatchOptions, decode: replaceDash };
    const third = { ...defaultUrlPathMatchOptions, decode: replaceUnderscore };

    expect(cache.get(first)).toBe(cache.get(second));
    expect(cache.get(first)).not.toBe(cache.get(third));
  });

  it('does not include function source text in custom decoder keys', () => {
    expect(
      createFunctionDecoderPathMatchKey({
        ...defaultUrlPathMatchOptions,
        decode: replaceDash,
      }),
    ).toBe(
      createFunctionDecoderPathMatchKey({
        ...defaultUrlPathMatchOptions,
        decode: replaceUnderscore,
      }),
    );
  });
});
