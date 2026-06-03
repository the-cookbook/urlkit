import { describe, expect, it } from 'vitest';
import type { EmptyParams } from '../contracts.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import { enumOf } from '../schema/enum-of.js';
import { string } from '../schema/string.js';
import type { UrlContract } from '../url/contracts.js';
import { url } from '../url/create-url.js';
import { hash } from './create-hash.js';

const expectType = <Value>(_value: Value): void => undefined;

describe('hash', () => {
  it('creates a pathless contract equivalent to url({ hash })', () => {
    const DocsHash = hash(enumOf(['intro', 'api']).optional());
    const DocsUrl = url({
      hash: enumOf(['intro', 'api']).optional(),
    });

    expect(DocsHash.pattern).toBeUndefined();
    expect(DocsHash.parse('/docs#api')).toEqual(DocsUrl.parse('/docs#api'));
    expect(DocsHash.build({ pathname: '/docs', hash: 'api' })).toBe(
      DocsUrl.build({ pathname: '/docs', hash: 'api' }),
    );
  });

  it('supports optional hash', () => {
    const DocsHash = hash(enumOf(['intro', 'api']).optional());

    expect(DocsHash.parse('/docs')).toEqual({
      pathname: '/docs',
      params: {},
      search: {},
      hash: undefined,
    });
    expect(DocsHash.parse('/docs#intro')).toEqual({
      pathname: '/docs',
      params: {},
      search: {},
      hash: 'intro',
    });
    expect(DocsHash.build({})).toBe('');
    expect(DocsHash.build({ hash: 'api' })).toBe('#api');
    expect(DocsHash.buildHash(undefined)).toBe('');
  });

  it('supports required hash', () => {
    const SectionHash = hash(string());

    expect(SectionHash.parse('/docs#overview')).toEqual({
      pathname: '/docs',
      params: {},
      search: {},
      hash: 'overview',
    });
    expect(SectionHash.build({ hash: 'overview' })).toBe('#overview');
    expect(SectionHash.buildHash('overview')).toBe('#overview');
    expect(() => SectionHash.parse('/docs')).toThrow(UrlKitError);
    expect(() => SectionHash.build({} as never)).toThrow(UrlKitError);
    expect(() => SectionHash.buildHash(undefined as never)).toThrow(UrlKitError);
  });

  it('supports default hash and default include/omit behavior', () => {
    const DocsHash = hash(enumOf(['overview', 'comments']).default('overview'));

    expect(DocsHash.parse('/docs')).toEqual({
      pathname: '/docs',
      params: {},
      search: {},
      hash: 'overview',
    });
    expect(DocsHash.build({})).toBe('#overview');
    expect(DocsHash.build({ hash: 'overview' })).toBe('#overview');
    expect(DocsHash.build({ hash: 'overview' }, { defaults: 'omit' })).toBe('');
    expect(DocsHash.build({ pathname: '/docs', hash: 'overview' }, { defaults: 'omit' })).toBe(
      '/docs',
    );
    expect(DocsHash.buildHash(undefined)).toBe('#overview');
    expect(DocsHash.buildHash('overview', { defaults: 'omit' })).toBe('');
    expect(DocsHash.buildHash('comments', { defaults: 'omit' })).toBe('#comments');
  });

  it('builds a hash suffix without pathname and a full path with pathname', () => {
    const DocsHash = hash(enumOf(['intro', 'api']).optional());

    expect(DocsHash.build({ hash: 'intro' })).toBe('#intro');
    expect(DocsHash.build({ pathname: '/docs', hash: 'api' })).toBe('/docs#api');
  });

  it('parses any pathname', () => {
    const DocsHash = hash(enumOf(['intro', 'api']).optional());

    expect(DocsHash.parse('/docs#intro')).toEqual({
      pathname: '/docs',
      params: {},
      search: {},
      hash: 'intro',
    });
    expect(DocsHash.parse('/anything/else#api')).toEqual({
      pathname: '/anything/else',
      params: {},
      search: {},
      hash: 'api',
    });
  });

  it('returns safe failures for invalid hash values', () => {
    const DocsHash = hash(enumOf(['intro', 'api']).required());

    expect(() => DocsHash.parse('/docs#missing')).toThrow(UrlKitError);

    const result = DocsHash.safeParse('/docs#missing');
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(UrlKitError);
      expect(result.error.code).toBe('invalid-hash');
    }
  });

  it('matches pathless UrlContract inference', () => {
    const DocsHash = hash(enumOf(['intro', 'api']).optional());
    const state = DocsHash.parse('/docs#intro');

    expectType<
      UrlContract<'pathless', string, EmptyParams, EmptyParams, 'intro' | 'api' | undefined>
    >(DocsHash);
    expectType<string>(state.pathname);
    expectType<EmptyParams>(state.params);
    expectType<EmptyParams>(state.search);
    expectType<'intro' | 'api' | undefined>(state.hash);
    expectType<never>(DocsHash.parsePathname);
    expectType<never>(DocsHash.buildPath);

    if (false) {
      const normalized = DocsHash.normalize({
        pathname: '/docs',
        hash: 'api',
      });
      expectType<'/docs'>(normalized.pathname);

      // @ts-expect-error pathless hash contracts do not accept params.
      DocsHash.build({ params: {}, hash: 'api' });
    }
  });

  it('infers required and default hash values', () => {
    const RequiredHash = hash(string());
    const DefaultHash = hash(enumOf(['overview', 'comments']).default('overview'));

    const requiredState = RequiredHash.parse('/docs#overview');
    const defaultState = DefaultHash.parse('/docs');

    expectType<string>(requiredState.hash);
    expectType<'overview' | 'comments'>(defaultState.hash);
  });
});
