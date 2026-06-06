import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { compileCachedStaticSearch } from './compile-cached-static-search.js';

describe('compileCachedStaticSearch', () => {
  it('reuses compiled static search schemas by descriptor identity', () => {
    const schema = {
      q: { type: 'string' },
      page: { type: 'int', default: 1 },
    } as const;

    const first = compileCachedStaticSearch(schema);
    const second = compileCachedStaticSearch(schema);

    expect(second).toBe(first);
  });

  it('does not share compiled schemas across different descriptor objects', () => {
    const first = compileCachedStaticSearch({ q: { type: 'string' } } as const);
    const second = compileCachedStaticSearch({ q: { type: 'string' } } as const);

    expect(second).not.toBe(first);
  });

  it('still validates invalid descriptors', () => {
    expect(() =>
      compileCachedStaticSearch({ page: { type: 'int', default: 1.5 } } as never),
    ).toThrow(expect.objectContaining({ code: 'invalid-descriptor' }));
    expect(() => compileCachedStaticSearch(null as never)).toThrow(UrlKitError);
  });
});
