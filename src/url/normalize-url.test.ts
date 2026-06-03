import { describe, expect, it } from 'vitest';
import { int } from '../schema/int.js';
import { compileRuntimeUrlDescriptor } from './compile-runtime-url-descriptor.js';
import { compileUrlDescriptor } from './compile-url-descriptor.js';
import { normalizeUrl } from './normalize-url.js';

describe('normalizeUrl', () => {
  it('delegates to compiled URL normalization', () => {
    const compiled = compileUrlDescriptor(
      compileRuntimeUrlDescriptor({ search: { page: int().default(1) } }),
    );

    expect(normalizeUrl({ pathname: '/products', search: {} }, compiled, 'strip')).toEqual({
      pathname: '/products',
      params: {},
      search: { page: 1 },
      hash: undefined,
    });
  });
});
