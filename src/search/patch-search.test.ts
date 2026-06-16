import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { boolean } from '../schema/boolean.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { patchSearch } from './patch-search.js';

describe('patchSearch', () => {
  it('patches raw search params while preserving existing params', () => {
    expect(patchSearch('?q=old&debug=true', { q: 'router', page: 2 })).toBe(
      '?q=router&debug=true&page=2',
    );
  });

  it('preserves repeated raw values that are not patched', () => {
    expect(patchSearch('?tag=react&tag=router&q=old', { q: 'new' })).toBe(
      '?tag=react&tag=router&q=new',
    );
  });

  it('replaces repeated raw values for patched keys', () => {
    expect(patchSearch('?tag=old&tag=older', { tag: ['react', 'router'] })).toBe(
      '?tag=react&tag=router',
    );
  });

  it('ignores undefined and null patch values by default', () => {
    expect(patchSearch('?q=router&page=2', { q: undefined, page: null })).toBe('?q=router&page=2');
  });

  it('removes undefined patch values when requested', () => {
    expect(patchSearch('?q=router&page=2', { page: undefined }, { removeUndefined: true })).toBe(
      '?q=router',
    );
  });

  it('removes null patch values when requested', () => {
    expect(patchSearch('?q=router&page=2', { page: null }, { removeNull: true })).toBe('?q=router');
  });

  it('supports build options for raw patches', () => {
    expect(patchSearch('?z=last', { a: 'first' }, { sortKeys: true })).toBe('?a=first&z=last');
  });

  it('patches schema-known values and preserves existing unknown params by default', () => {
    expect(patchSearch('?q=old&debug=true', { q: 'router' }, { schema: { q: string() } })).toBe(
      '?q=router&debug=true',
    );
  });

  it('strips unknown runtime patch keys when a schema is provided', () => {
    const patch: Record<string, unknown> = { q: 'router', preview: true };

    expect(patchSearch('?q=old&debug=true', patch, { schema: { q: string() } })).toBe(
      '?q=router&debug=true',
    );
  });

  it('can remove preserved unknown params with removeUndefined', () => {
    const patch: Record<string, unknown> = { debug: undefined };

    expect(
      patchSearch('?q=router&debug=true', patch, {
        schema: { q: string() },
        removeUndefined: true,
      }),
    ).toBe('?q=router');
  });

  it('does not fail on current missing required schema fields when the patch supplies them', () => {
    expect(patchSearch('?debug=true', { q: 'router' }, { schema: { q: string() } })).toBe(
      '?q=router&debug=true',
    );
  });

  it('validates the final schema-aware patch result', () => {
    expect(() => patchSearch('?debug=true', {}, { schema: { q: string() } })).toThrow(
      expect.objectContaining({ code: 'missing-search', path: ['q'] }),
    );
  });

  it('validates patched schema values', () => {
    expect(() => patchSearch('?page=2', { page: 1.5 }, { schema: { page: int() } })).toThrow(
      UrlKitError,
    );
  });

  it('serializes schema values using configured field types', () => {
    expect(
      patchSearch(
        '?q=old&tag=react&active=true',
        { q: 'router', tag: ['ts', 'url'], active: false },
        { schema: { q: string(), tag: { type: 'many', value: string() }, active: boolean() } },
      ),
    ).toBe('?q=router&tag=ts&tag=url&active=false');
  });

  it('supports default omission for schema-aware patches', () => {
    expect(
      patchSearch('?page=2', { page: 1 }, { schema: { page: int().default(1) }, defaults: 'omit' }),
    ).toBe('');
  });
});
