import { describe, expect, it } from 'vitest';
import { enumOf } from '../schema/enum-of.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { compileRuntimeUrlDescriptor } from './compile-runtime-url-descriptor.js';
import { compileUrlDescriptor, type CompiledUrlDescriptor } from './compile-url-descriptor.js';
import type { RuntimeUrlDescriptor } from './contracts.js';
import { url } from './create-url.js';
import { matchCompiledUrl } from './match-url.js';

function compileRuntime<const Descriptor extends RuntimeUrlDescriptor>(descriptor: Descriptor) {
  return compileUrlDescriptor(compileRuntimeUrlDescriptor(descriptor));
}

describe('matchCompiledUrl', () => {
  it('returns true for valid path-based URLs', () => {
    const compiled = compileRuntime({
      path: '/users/{id:int}',
      search: {
        tab: enumOf(['profile', 'settings']).default('profile'),
      },
      hash: enumOf(['activity', 'comments']).optional(),
    });

    expect(matchCompiledUrl('/users/42?tab=settings#activity', compiled, 'strip')).toBe(true);
  });

  it('returns false for path mismatches and invalid params without throwing', () => {
    const compiled = compileRuntime({ path: '/users/{id:int}' });

    expect(() => matchCompiledUrl('/teams/42', compiled, 'strip')).not.toThrow();
    expect(() => matchCompiledUrl('/users/wrong', compiled, 'strip')).not.toThrow();
    expect(matchCompiledUrl('/teams/42', compiled, 'strip')).toBe(false);
    expect(matchCompiledUrl('/users/wrong', compiled, 'strip')).toBe(false);
  });

  it('validates required search fields', () => {
    const compiled = compileRuntime({
      path: '/search',
      search: {
        q: string(),
      },
    });

    expect(matchCompiledUrl('/search?q=router', compiled, 'strip')).toBe(true);
    expect(matchCompiledUrl('/search', compiled, 'strip')).toBe(false);
  });

  it('does not require defaulted search values to be serialized', () => {
    const compiled = compileRuntime({
      path: '/search',
      search: {
        q: string(),
        page: int().default(1),
      },
      hash: enumOf(['overview', 'results']).default('overview'),
    });

    expect(matchCompiledUrl('/search?q=router', compiled, 'strip')).toBe(true);
  });

  it('applies hash presence consistently for required, optional, and defaulted hashes', () => {
    const required = compileRuntime({
      path: '/docs',
      hash: enumOf(['overview', 'results']),
    });
    const optional = compileRuntime({
      path: '/docs',
      hash: enumOf(['overview', 'results']).optional(),
    });
    const defaulted = compileRuntime({
      path: '/docs',
      hash: enumOf(['overview', 'results']).default('overview'),
    });

    expect(matchCompiledUrl('/docs', required, 'strip')).toBe(false);
    expect(matchCompiledUrl('/docs#overview', required, 'strip')).toBe(true);
    expect(matchCompiledUrl('/docs', optional, 'strip')).toBe(true);
    expect(matchCompiledUrl('/docs', defaulted, 'strip')).toBe(true);
  });

  it('returns false for invalid search and invalid hash values', () => {
    const compiled = compileRuntime({
      path: '/search',
      search: {
        page: int().optional(),
      },
      hash: enumOf(['overview', 'results']).optional(),
    });

    expect(matchCompiledUrl('/search?page=wrong', compiled, 'strip')).toBe(false);
    expect(matchCompiledUrl('/search#other', compiled, 'strip')).toBe(false);
  });

  it('uses arrayFormat options when validating array search fields', () => {
    const compiled = compileRuntime({
      path: '/search',
      search: {
        page: { type: 'many', value: int() },
      },
    });

    expect(matchCompiledUrl('/search?page=1%2C2', compiled, 'strip')).toBe(false);
    expect(
      matchCompiledUrl('/search?page=1%2C2', compiled, 'strip', { arrayFormat: 'comma' }),
    ).toBe(true);
  });

  it('applies unknownSearch behavior', () => {
    const compiled = compileRuntime({
      path: '/search',
      search: {
        q: string(),
      },
    });

    expect(matchCompiledUrl('/search?q=router&debug=true', compiled, 'strip')).toBe(true);
    expect(matchCompiledUrl('/search?q=router&debug=true', compiled, 'preserve')).toBe(true);
    expect(matchCompiledUrl('/search?q=router&debug=true', compiled, 'error')).toBe(false);
  });

  it('ignores pathname for pathless contracts while validating search and hash', () => {
    const compiled = compileRuntime({
      search: {
        page: int().default(1),
      },
      hash: enumOf(['comments', 'share']).optional(),
    });

    expect(matchCompiledUrl('/products?page=2#comments', compiled, 'strip')).toBe(true);
    expect(matchCompiledUrl('/anything?page=2#comments', compiled, 'strip')).toBe(true);
    expect(matchCompiledUrl('/anything?page=wrong#comments', compiled, 'strip')).toBe(false);
    expect(matchCompiledUrl('/anything?page=2#invalid', compiled, 'strip')).toBe(false);
  });

  it('returns false for invalid serialized input without throwing', () => {
    const compiled = compileRuntime({ path: '/users/{id:int}' });

    expect(() => matchCompiledUrl({ params: { id: 1 } } as never, compiled, 'strip')).not.toThrow();
    expect(matchCompiledUrl({ params: { id: 1 } } as never, compiled, 'strip')).toBe(false);
  });

  it('rethrows unexpected non-UrlKit errors instead of hiding delegated failures', () => {
    const unexpected = new Error('Unexpected delegated path failure.');
    const compiled = {
      mode: 'path',
      pattern: '/broken',
      path: {
        pattern: '/broken',
        parsePathname() {
          throw unexpected;
        },
        buildPath() {
          return '/broken';
        },
      },
    } as unknown as CompiledUrlDescriptor<'path'>;

    expect(() => matchCompiledUrl('/broken', compiled, 'strip')).toThrow(unexpected);
  });
});

describe('UrlContract.match', () => {
  it('exposes public non-throwing match behavior', () => {
    const UserUrl = url({
      path: '/users/{id:int}',
      search: {
        tab: enumOf(['profile', 'settings']).default('profile'),
      },
      hash: enumOf(['activity', 'comments']).optional(),
    });

    expect(UserUrl.match('/users/42#activity')).toBe(true);
    expect(UserUrl.match('/users/wrong#activity')).toBe(false);
    expect(UserUrl.match('/users/42#other')).toBe(false);
  });

  it('uses contract-level arrayFormat and method-level overrides', () => {
    const SearchUrl = url(
      {
        path: '/search',
        search: {
          page: { type: 'many', value: int() },
        },
      },
      {
        arrayFormat: 'comma',
      },
    );

    expect(SearchUrl.match('/search?page=1%2C2')).toBe(true);
    expect(SearchUrl.match('/search?page=1%2Cwrong')).toBe(false);
    expect(SearchUrl.match('/search?page=1%2C2', { arrayFormat: 'repeat' })).toBe(false);
  });

  it('uses contract-level unknownSearch and method-level overrides', () => {
    const SearchUrl = url(
      {
        path: '/search',
        search: {
          q: string(),
        },
      },
      {
        unknownSearch: 'error',
      },
    );

    expect(SearchUrl.match('/search?q=router&debug=true')).toBe(false);
    expect(SearchUrl.match('/search?q=router&debug=true', { unknownSearch: 'strip' })).toBe(true);
    expect(SearchUrl.match('/search?q=router&debug=true', { unknownSearch: 'preserve' })).toBe(
      true,
    );
  });

  it('ignores pathname for public pathless contracts', () => {
    const FiltersUrl = url({
      search: {
        q: string(),
      },
    });

    expect(FiltersUrl.match('/products?q=router')).toBe(true);
    expect(FiltersUrl.match('/docs?q=router')).toBe(true);
    expect(FiltersUrl.match('/docs')).toBe(false);
  });

  it('matches URL instances', () => {
    const UserUrl = url({ path: '/users/{id:int}' });

    expect(UserUrl.match(new URL('https://example.com/users/42'))).toBe(true);
    expect(UserUrl.match(new URL('https://example.com/users/wrong'))).toBe(false);
  });
});
