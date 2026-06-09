import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { compileStaticUrl } from '../static/compile-static-url.js';
import { createUrlContract } from './create-url-contract.js';
import type { ParamsFromPattern, PathnameFromPattern, UrlContract } from './contracts.js';

const expectType = <Value>(_value: Value): void => undefined;

describe('createUrlContract', () => {
  it('creates a frozen path contract with the public UrlContract shape', () => {
    const descriptor = compileStaticUrl({
      path: '/users/{id:int}',
      search: {
        tab: { type: 'string', default: 'profile' },
      },
      hash: { type: 'enum', values: ['activity', 'comments'], optional: true },
    });
    const contract = createUrlContract<
      'path',
      PathnameFromPattern<'/users/{id:int}'>,
      ParamsFromPattern<'/users/{id:int}'>,
      { readonly tab: string },
      'activity' | 'comments' | undefined
    >(descriptor);

    expect(contract.pattern).toBe('/users/{id:int}');
    expect(contract.parsePathname('/users/42')).toEqual({ id: 42 });
    expect(contract.buildPath({ id: 42 })).toBe('/users/42');
    expect(contract.parseSearch('?tab=settings')).toEqual({ tab: 'settings' });
    expect(contract.parseSearch('')).toEqual({ tab: 'profile' });
    expect(contract.buildSearch({ tab: 'settings' })).toBe('?tab=settings');
    expect(contract.parseHash('#activity')).toBe('activity');
    expect(contract.buildHash('comments')).toBe('#comments');
    expect(Object.isFrozen(contract)).toBe(true);

    expectType<
      UrlContract<
        'path',
        `/users/${number}`,
        { readonly id: number },
        { readonly tab: string },
        'activity' | 'comments' | undefined
      >
    >(contract);
  });

  it('creates a pathless contract with undefined pattern and unavailable path methods', () => {
    const contract = createUrlContract<'pathless'>(
      compileStaticUrl({ search: { q: { type: 'string' } } }),
    );

    expect(contract.pattern).toBeUndefined();
    expect(
      (contract as unknown as { readonly parsePathname?: unknown }).parsePathname,
    ).toBeUndefined();
    expect((contract as unknown as { readonly buildPath?: unknown }).buildPath).toBeUndefined();
  });

  it('uses compiled search fields captured at construction time', () => {
    const search = {
      q: string(),
    };
    const descriptor = {
      mode: 'pathless',
      pattern: undefined,
      search,
    } as const;
    const contract = createUrlContract<'pathless', string, {}, { readonly q: string }>(descriptor);

    (search as Record<string, unknown>).later = int();

    expect(contract.parseSearch('?q=router&later=1')).toEqual({ q: 'router' });
  });

  it('uses compiled hash descriptors captured at construction time', () => {
    const hash = {
      kind: 'enum',
      presence: 'optional',
      values: ['one', 'two'],
    } as const;
    const contract = createUrlContract<'pathless', string, {}, {}, 'one' | 'two' | undefined>({
      mode: 'pathless',
      pattern: undefined,
      hash,
    });

    (hash.values as unknown as string[]).push('three');

    expect(() => contract.parseHash('#three')).toThrow(UrlKitError);
  });

  it('parses, normalizes, and builds full URL state from the compiled descriptor', () => {
    const contract = createUrlContract<
      'path',
      PathnameFromPattern<'/users/{id:int}'>,
      ParamsFromPattern<'/users/{id:int}'>,
      {},
      undefined
    >(compileStaticUrl({ path: '/users/{id:int}' }));

    expect(contract.parse('/users/1')).toEqual({
      pathname: '/users/1',
      params: { id: 1 },
      search: {},
      hash: undefined,
    });

    expect(contract.normalize({ params: { id: 1 } })).toEqual({
      pathname: '/users/1',
      params: { id: 1 },
      search: {},
      hash: undefined,
    });

    expect(contract.build({ params: { id: 1 } })).toBe('/users/1');
  });
});
