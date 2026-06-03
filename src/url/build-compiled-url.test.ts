import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { dateTime } from '../schema/date-time.js';
import { enumOf } from '../schema/enum-of.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { compileRuntimeUrlDescriptor } from './compile-runtime-url-descriptor.js';
import { compileUrlDescriptor } from './compile-url-descriptor.js';
import type { RuntimeUrlDescriptor } from './contracts.js';
import { buildCompiledUrl } from './build-compiled-url.js';
import { markUrlState } from './url-state-brand.js';

function compileRuntime<const Descriptor extends RuntimeUrlDescriptor>(descriptor: Descriptor) {
  return compileUrlDescriptor(compileRuntimeUrlDescriptor(descriptor));
}

describe('buildCompiledUrl', () => {
  it('builds path-based URLs from params, search, and hash', () => {
    const compiled = compileRuntime({
      path: '/users/{id:int}',
      search: {
        tab: enumOf(['profile', 'settings']).default('profile'),
        page: int().default(1),
      },
      hash: enumOf(['activity', 'comments']).optional(),
    });

    expect(
      buildCompiledUrl(
        { params: { id: 42 }, search: { tab: 'settings', page: 2 }, hash: 'activity' },
        compiled,
      ),
    ).toBe('/users/42?tab=settings&page=2#activity');
  });

  it('allows path-based static paths without params', () => {
    const compiled = compileRuntime({
      path: '/search',
      search: {
        q: string(),
      },
    });

    expect(buildCompiledUrl({ search: { q: 'router' } }, compiled)).toBe('/search?q=router');
    expect(buildCompiledUrl({ params: {}, search: { q: 'router' } }, compiled)).toBe(
      '/search?q=router',
    );
  });

  it('rejects pathname input for path-based contracts unless it is URLKit-produced state', () => {
    const compiled = compileRuntime({ path: '/users/{id:int}' });

    expect(() =>
      buildCompiledUrl({ pathname: '/users/1', params: { id: 1 } } as never, compiled),
    ).toThrow(UrlKitError);
    expect(() =>
      buildCompiledUrl({ pathname: '/users/1', params: { id: 1 } } as never, compiled),
    ).toThrow('Path-based URL build input must not include pathname.');

    expect(
      buildCompiledUrl(
        markUrlState({
          pathname: '/users/1',
          params: { id: 1 },
          search: {},
          hash: undefined,
        }) as never,
        compiled,
      ),
    ).toBe('/users/1');
  });

  it('maps missing and invalid path params through the compiled path builder', () => {
    const compiled = compileRuntime({ path: '/users/{id:int}' });

    expect(() => buildCompiledUrl({}, compiled)).toThrow(UrlKitError);
    expect(() => buildCompiledUrl({ params: { id: 'wrong' } }, compiled)).toThrow(UrlKitError);
  });

  it('builds pathless suffixes when pathname is omitted', () => {
    const compiled = compileRuntime({
      search: {
        page: int().default(1),
      },
      hash: enumOf(['comments', 'share']).optional(),
    });

    expect(buildCompiledUrl({ search: { page: 2 } }, compiled)).toBe('?page=2');
    expect(buildCompiledUrl({ hash: 'comments' }, compiled)).toBe('?page=1#comments');
    expect(buildCompiledUrl({ search: { page: 2 }, hash: 'comments' }, compiled)).toBe(
      '?page=2#comments',
    );
  });

  it('builds full pathless URLs when pathname is provided', () => {
    const compiled = compileRuntime({
      search: {
        page: int().default(1),
      },
    });

    expect(buildCompiledUrl({ pathname: '/products', search: { page: 2 } }, compiled)).toBe(
      '/products?page=2',
    );
  });

  it('rejects params for pathless build input unless it is URLKit-produced state', () => {
    const compiled = compileRuntime({ search: { q: string().optional() } });

    expect(() =>
      buildCompiledUrl({ params: {}, search: { q: 'router' } } as never, compiled),
    ).toThrow(UrlKitError);
    expect(() =>
      buildCompiledUrl({ pathname: 1, search: { q: 'router' } } as never, compiled),
    ).toThrow(UrlKitError);
    expect(
      buildCompiledUrl(
        markUrlState({
          pathname: '/search',
          params: {},
          search: { q: 'router' },
          hash: undefined,
        }) as never,
        compiled,
      ),
    ).toBe('/search?q=router');
  });

  it('includes defaults by default and omits defaults when requested', () => {
    const compiled = compileRuntime({
      path: '/search',
      search: {
        q: string(),
        page: int().default(1),
      },
      hash: enumOf(['overview', 'results']).default('overview'),
    });

    expect(buildCompiledUrl({ search: { q: 'router' } }, compiled)).toBe(
      '/search?q=router&page=1#overview',
    );
    expect(
      buildCompiledUrl({ search: { q: 'router', page: 1 }, hash: 'overview' }, compiled, {
        defaults: 'omit',
      }),
    ).toBe('/search?q=router');
  });

  it('compares normalized date defaults when omitting defaults', () => {
    const compiled = compileRuntime({
      path: '/events',
      search: {
        startsAt: dateTime().default(new Date('2026-01-01T10:30:00.000Z')),
      },
    });

    expect(
      buildCompiledUrl({ search: { startsAt: new Date('2026-01-01T10:30:00.000Z') } }, compiled, {
        defaults: 'omit',
      }),
    ).toBe('/events');
  });

  it('strips unknown search keys and ignores preserved unknownSearch from parsed state', () => {
    const compiled = compileRuntime({
      path: '/search',
      search: {
        q: string(),
      },
    });

    expect(
      buildCompiledUrl(
        {
          search: { q: 'router', debug: 'true' } as never,
          unknownSearch: { debug: 'true' },
        } as never,
        compiled,
      ),
    ).toBe('/search?q=router');
  });

  it('rejects undeclared hash values', () => {
    const compiled = compileRuntime({ path: '/docs' });

    expect(() => buildCompiledUrl({ hash: 'comments' }, compiled)).toThrow(UrlKitError);
  });

  it('returns an empty string for empty pathless contracts', () => {
    const compiled = compileRuntime({});

    expect(buildCompiledUrl({}, compiled)).toBe('');
  });
});
