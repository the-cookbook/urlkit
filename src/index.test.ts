import packageJson from '../package.json' with { type: 'json' };
import { describe, expect, it } from 'vitest';
import {
  UrlKitError,
  array,
  boolean,
  createConstraint,
  date,
  dateTime,
  enumOf,
  hash,
  hasPathConstraint,
  int,
  number as numberSchema,
  object,
  registerPathConstraint,
  registerPathConstraints,
  search,
  string,
  url,
} from './index.js';
import type {
  BuildSearchOptions,
  BuildUrlOptions,
  DateFormatCodec,
  EmptyParams,
  NormalizeUrlOptions,
  ParseRequestOptions,
  ParseUrlOptions,
  SearchArrayFormat,
  PatchSearchOptions,
  PathBuildMethod,
  PathConstraintMap,
  RegisterPathConstraintOptions,
  UnknownSearchBehavior,
  UnknownSearchParams,
  UrlMode,
  UrlRequestInput,
  UrlSafeNormalizeResult,
  UrlSafeParseResult,
  UrlState,
  ConstraintValidation,
} from './index.js';

const expectType = <Value>(_value: Value): void => undefined;

describe('main public exports', () => {
  it('exports the required public factories and builders', () => {
    expect(url).toBeTypeOf('function');
    expect(search).toBeTypeOf('function');
    expect(hash).toBeTypeOf('function');
    expect(hasPathConstraint).toBeTypeOf('function');
    expect(string).toBeTypeOf('function');
    expect(numberSchema).toBeTypeOf('function');
    expect(int).toBeTypeOf('function');
    expect(boolean).toBeTypeOf('function');
    expect(createConstraint).toBeTypeOf('function');
    expect(date).toBeTypeOf('function');
    expect(dateTime).toBeTypeOf('function');
    expect(array).toBeTypeOf('function');
    expect(enumOf).toBeTypeOf('function');
    expect(object).toBeTypeOf('function');
    expect(registerPathConstraint).toBeTypeOf('function');
    expect(registerPathConstraints).toBeTypeOf('function');
  });

  it('exports UrlKitError', () => {
    const error = new UrlKitError('invalid-url');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(UrlKitError);
    expect(error.code).toBe('invalid-url');
  });

  it('exports user-facing contracts', () => {
    expectType<UrlMode>('path');
    expectType<UnknownSearchBehavior>('strip');
    expectType<SearchArrayFormat>('comma');
    expectType<UnknownSearchParams>({ debug: 'true', tag: ['a', 'b'] });
    expectType<EmptyParams>({});
    expectType<ParseUrlOptions>({ unknownSearch: 'preserve', arrayFormat: 'comma' });
    expectType<NormalizeUrlOptions>({ unknownSearch: 'error' });
    expectType<BuildUrlOptions>({ defaults: 'omit', arrayFormat: 'comma' });
    expectType<BuildSearchOptions>({ defaults: 'include', arrayFormat: 'repeat', sortKeys: true });
    expectType<PatchSearchOptions>({ removeNull: true, removeUndefined: true });
    expectType<RegisterPathConstraintOptions>({ overwrite: true });
    expectType<UrlRequestInput>({ url: '/users/42' });
    expectType<ParseRequestOptions>({
      baseUrl: 'https://example.com',
      unknownSearch: 'strip',
      arrayFormat: 'comma',
    });
    expectType<UrlState<'/users/42', { readonly id: number }, { readonly q: string }, undefined>>({
      pathname: '/users/42',
      params: { id: 42 },
      search: { q: 'router' },
      hash: undefined,
    });
    expectType<UrlSafeParseResult<string, EmptyParams, EmptyParams, undefined>>({
      success: true,
      data: {
        pathname: '/docs',
        params: {},
        search: {},
        hash: undefined,
      },
    });
    expectType<
      UrlSafeNormalizeResult<
        'pathless',
        string,
        EmptyParams,
        EmptyParams,
        undefined,
        { readonly pathname: '/docs' }
      >
    >({
      success: true,
      data: {
        pathname: '/docs',
        params: {},
        search: {},
        hash: undefined,
      },
    });
    expectType<PathBuildMethod<{ readonly id: number }>>(
      (params: { readonly id: number }) => `/users/${params.id}`,
    );
    const constraint = createConstraint({
      parse() {},
      verify() {},
      toRegExp() {
        return '[a-z]+';
      },
    });
    expectType<ConstraintValidation>(constraint);
    expectType<PathConstraintMap>({ urlkitindexconstraint: constraint });
  });

  it('exports the custom date format codec contract', () => {
    const codec: DateFormatCodec = {
      parse(value) {
        return new Date(`${value}T00:00:00.000Z`);
      },
      serialize(value) {
        return value.toISOString().slice(0, 10);
      },
    };

    const contract = url({
      search: {
        day: date({ format: codec }),
      },
    });

    expect(contract.build({ search: { day: new Date('2026-06-02T00:00:00.000Z') } })).toBe(
      '?day=2026-06-02',
    );
  });

  it('keeps package exports aligned with the public entries', () => {
    expect(Object.keys(packageJson.exports).sort()).toEqual(['.', './router-runtime', './static']);
    expect(packageJson.exports['.']).toEqual({
      types: './dist/index.d.ts',
      import: './dist/index.js',
    });
    expect(packageJson.exports['./static']).toEqual({
      types: './dist/static.d.ts',
      import: './dist/static.js',
    });
    expect(packageJson.exports['./router-runtime']).toEqual({
      types: './dist/router-runtime.d.ts',
      import: './dist/router-runtime.js',
    });
  });

  it('does not add framework packages as dependencies', () => {
    const dependencyNames = [
      ...Object.keys(packageJson.dependencies ?? {}),
      ...Object.keys(packageJson.devDependencies ?? {}),
    ];

    expect(dependencyNames).not.toContain('react');
    expect(dependencyNames).not.toContain('express');
    expect(dependencyNames).not.toContain('hono');
    expect(dependencyNames).not.toContain('fastify');
    expect(dependencyNames).not.toContain('next');
    expect(dependencyNames).not.toContain('@cookbook/router');
    expect(dependencyNames).not.toContain('@cookbook/router-react');
  });
});
