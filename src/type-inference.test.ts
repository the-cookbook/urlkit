import { describe, it } from 'vitest';
import type { UnknownSearchParams, UrlBuildInput, UrlNormalizeInput } from './contracts.js';
import { hash } from './hash/create-hash.js';
import { array } from './schema/array.js';
import { boolean } from './schema/boolean.js';
import { date } from './schema/date.js';
import { dateTime } from './schema/date-time.js';
import { enumOf } from './schema/enum-of.js';
import { int } from './schema/int.js';
import { number as numberSchema } from './schema/number.js';
import { object } from './schema/object.js';
import { string } from './schema/string.js';
import type { InferStaticSearch } from './static/contracts.js';
import { createRouteUrlContract } from './runtime/create-route-url-contract.js';
import type { ParamsFromPattern, PathnameFromPattern } from './url/contracts.js';
import { url } from './url/create-url.js';

const expectType = <Value>(_value: Value): void => undefined;

type Expect<Condition extends true> = Condition;
type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends <Value>() => Value extends Right ? 1 : 2
    ? (<Value>() => Value extends Right ? 1 : 2) extends <Value>() => Value extends Left ? 1 : 2
      ? true
      : false
    : false;

describe('comprehensive TypeScript inference', () => {
  it('infers path params and template literal pathnames from path patterns', () => {
    type UserPathname = PathnameFromPattern<'/users/{id:int}'>;
    type ArticlePathname = PathnameFromPattern<'/articles/{slug:regex([a-z0-9-]+)}'>;
    type TeamUserPathname = PathnameFromPattern<'/teams/{teamId}/users/{userId:int}'>;
    type ProductPathname = PathnameFromPattern<'/products/{sku}/prices/{amount:range(1,10)}'>;

    type UserParams = ParamsFromPattern<'/users/{id:int}'>;
    type ArticleParams = ParamsFromPattern<'/articles/{slug:regex([a-z0-9-]+)}'>;
    type TeamUserParams = ParamsFromPattern<'/teams/{teamId}/users/{userId:int}'>;
    type ProductParams = ParamsFromPattern<'/products/{sku}/prices/{amount:range(1,100)}'>;

    type _UserPathname = Expect<Equal<UserPathname, `/users/${number}`>>;
    type _ArticlePathname = Expect<Equal<ArticlePathname, `/articles/${string}`>>;
    type _TeamUserPathname = Expect<Equal<TeamUserPathname, `/teams/${string}/users/${number}`>>;
    type _ProductPathname = Expect<Equal<ProductPathname, `/products/${string}/prices/${number}`>>;
    type _UserParams = Expect<Equal<UserParams, { readonly id: number }>>;
    type _ArticleParams = Expect<Equal<ArticleParams, { readonly slug: string }>>;
    type _TeamUserParams = Expect<
      Equal<TeamUserParams, { readonly teamId: string; readonly userId: number }>
    >;
    type _ProductParams = Expect<
      Equal<ProductParams, { readonly sku: string; readonly amount: number }>
    >;

    expectType<UserPathname>('/users/42');
    expectType<ArticlePathname>('/articles/post-1');
  });

  it('infers weighted chained constraints in runtime URL contracts', () => {
    const OptionalMinUrl = url({ path: '/users/{id:min(1)?}' });
    const RequiredMinUrl = url({ path: '/users/{id:min(1)}' });
    const RegexMinUrl = url({ path: '/scores/{id:regex(\\d):min(1)}' });
    const UuidUrl = url({ path: '/users/{id:uuid}' });
    const SlugUrl = url({ path: '/articles/{slug:minlength(3):maxlength(50)}' });

    const optionalParsed = OptionalMinUrl.parse('/users/2');
    const requiredParsed = RequiredMinUrl.parse('/users/2');
    const regexMinParsed = RegexMinUrl.parse('/scores/2');
    const uuidParsed = UuidUrl.parse('/users/7d444840-9dc0-11d1-b245-5ffdce74fad2');
    const slugParsed = SlugUrl.parse('/articles/hello');

    expectType<number | undefined>(optionalParsed.params.id);
    expectType<number>(requiredParsed.params.id);
    expectType<number>(regexMinParsed.params.id);
    expectType<string>(uuidParsed.params.id);
    expectType<string>(slugParsed.params.slug);

    OptionalMinUrl.build({});
    OptionalMinUrl.build({ params: {} });
    OptionalMinUrl.build({ params: { id: 2 } });

    if (false) {
      // @ts-expect-error required path params cannot be omitted.
      RequiredMinUrl.build({});
    }
  });
  it('infers runtime builder search values', () => {
    const SearchUrl = url({
      path: '/search',
      search: {
        q: string(),
        page: int().default(1),
        rating: numberSchema().optional(),
        includeArchived: boolean().default(false),
        sort: enumOf(['newest', 'popular'] as const).default('newest'),
        tags: array(string()).default([]),
        createdOn: date().optional(),
        createdAt: dateTime().optional(),
      },
    });

    const state = SearchUrl.parse('/search?q=urlkit&page=2&tags=ts');

    expectType<string>(state.search.q);
    expectType<number>(state.search.page);
    expectType<number | undefined>(state.search.rating);
    expectType<boolean>(state.search.includeArchived);
    expectType<'newest' | 'popular'>(state.search.sort);
    expectType<readonly string[]>(state.search.tags);
    expectType<Date | undefined>(state.search.createdOn);
    expectType<Date | undefined>(state.search.createdAt);

    type Search = typeof state.search;
    type _Search = Expect<
      Equal<
        Search,
        {
          readonly q: string;
          readonly page: number;
          readonly rating?: number;
          readonly includeArchived: boolean;
          readonly sort: 'newest' | 'popular';
          readonly tags: readonly string[];
          readonly createdOn?: Date;
          readonly createdAt?: Date;
        }
      >
    >;
  });

  it('infers enum, array, object, and date fields', () => {
    const TableUrl = url({
      search: {
        view: enumOf(['table', 'cards'] as const).default('table'),
        selected: array(enumOf(['draft', 'published'] as const)).default([]),
        filter: object({
          role: string().optional(),
          active: boolean().optional(),
          tags: array(string()).default([]),
          createdAt: dateTime().optional(),
          status: enumOf(['open', 'closed'] as const).default('open'),
        }),
      },
    });

    const state = TableUrl.parse('/admin?filter.role=admin&filter.tags=core&selected=draft');

    expectType<'table' | 'cards'>(state.search.view);
    expectType<readonly ('draft' | 'published')[]>(state.search.selected);
    expectType<{
      readonly role?: string;
      readonly active?: boolean;
      readonly tags: readonly string[];
      readonly createdAt?: Date;
      readonly status: 'open' | 'closed';
    }>(state.search.filter);
  });

  it('infers static descriptor search values', () => {
    const descriptor = {
      ref: {
        type: 'string',
        optional: true,
      },
      filters: {
        type: 'string',
        many: true,
        optional: true,
      },
      page: {
        type: 'int',
        default: 1,
      },
      sort: {
        type: 'enum',
        values: ['newest', 'popular'],
        default: 'newest',
      },
      startsAt: {
        type: 'date-time',
        optional: true,
      },
    } as const;

    type Search = InferStaticSearch<typeof descriptor>;
    type _Search = Expect<
      Equal<
        Search,
        {
          readonly ref?: string;
          readonly filters?: readonly string[];
          readonly page: number;
          readonly sort: 'newest' | 'popular';
          readonly startsAt?: Date;
        }
      >
    >;

    const routeUrl = createRouteUrlContract({
      path: '/articles/{slug}',
      search: descriptor,
    } as const);
    const state = routeUrl.parse('/articles/post-1?page=2&sort=popular');

    expectType<string | undefined>(state.search.ref);
    expectType<readonly string[] | undefined>(state.search.filters);
    expectType<number>(state.search.page);
    expectType<'newest' | 'popular'>(state.search.sort);
    expectType<Date | undefined>(state.search.startsAt);
  });

  it('infers hash optional/default states', () => {
    const OptionalHashUrl = hash(enumOf(['intro', 'api'] as const).optional());
    const RequiredHashUrl = hash(enumOf(['intro', 'api'] as const));
    const DefaultHashUrl = hash(enumOf(['intro', 'api'] as const).default('intro'));

    expectType<'intro' | 'api' | undefined>(OptionalHashUrl.parse('/docs#intro').hash);
    expectType<'intro' | 'api'>(RequiredHashUrl.parse('/docs#intro').hash);
    expectType<'intro' | 'api'>(DefaultHashUrl.parse('/docs').hash);
  });

  it('keeps unknown search params out of typed search', () => {
    const SearchUrl = url({
      path: '/search',
      search: {
        q: string(),
      },
    });

    const state = SearchUrl.parse('/search?q=urlkit&debug=true', { unknownSearch: 'preserve' });

    expectType<string>(state.search.q);
    expectType<UnknownSearchParams | undefined>(state.unknownSearch);

    if (false) {
      // @ts-expect-error preserved unknown params live in state.unknownSearch, not in typed search.
      state.search.debug;
    }
  });

  it('uses mode-aware build inputs', () => {
    const UserUrl = url({ path: '/users/{id:int}', search: { tab: string().optional() } });
    const SearchUrl = url({ path: '/search', search: { q: string() } });
    const FiltersUrl = url({ search: { page: int().default(1) } });
    const RequiredSearchUrl = url({
      path: '/users/{id:int}',
      search: {
        tab: string().default('profile'),
        page: int(),
      },
    });
    const RequiredHashUrl = url({
      path: '/docs',
      hash: enumOf(['overview', 'comments'] as const),
    });
    const OptionalHashUrl = url({
      path: '/docs',
      hash: enumOf(['overview', 'comments'] as const).optional(),
    });
    const DefaultHashUrl = url({
      path: '/docs',
      hash: enumOf(['overview', 'comments'] as const).default('overview'),
    });
    const StaticRouteUrl = createRouteUrlContract({
      path: '/articles/{slug}',
      search: {
        page: { type: 'int' },
        sort: { type: 'enum', values: ['newest', 'popular'], default: 'newest' },
      },
    } as const);

    UserUrl.build({ params: { id: 1 }, search: { tab: 'profile' } });
    SearchUrl.build({ search: { q: 'router' } });
    FiltersUrl.build({ search: { page: 2 } });
    FiltersUrl.build({ pathname: '/products', search: { page: 2 } });
    RequiredSearchUrl.build({ params: { id: 1 }, search: { page: 1 } });
    RequiredHashUrl.build({ hash: 'overview' });
    RequiredHashUrl.buildHash('overview');
    OptionalHashUrl.build({});
    OptionalHashUrl.buildHash();
    DefaultHashUrl.build({});
    DefaultHashUrl.buildHash();
    RequiredSearchUrl.buildSearch({ page: 1 });
    RequiredSearchUrl.replaceSearch('/users/1?page=1', { page: 2 });
    StaticRouteUrl.build({ params: { slug: 'post-1' }, search: { page: 1 } });

    if (false) {
      // @ts-expect-error path params are required for path-based contracts with params.
      UserUrl.build({ search: { tab: 'profile' } });

      // @ts-expect-error path-based build accepts params, not caller-provided pathname.
      UserUrl.build({ pathname: '/users/1', params: { id: 1 } });

      // @ts-expect-error pathless build rejects params.
      FiltersUrl.build({ params: {} });

      // @ts-expect-error required search fields without defaults must be present in build input.
      RequiredSearchUrl.build({ params: { id: 1 }, search: { tab: 'settings' } });

      // @ts-expect-error required search fields make the search object itself required.
      RequiredSearchUrl.build({ params: { id: 1 } });

      // @ts-expect-error required hash fields without defaults must be present in build input.
      RequiredHashUrl.build({});

      // @ts-expect-error buildHash requires required hash values without defaults.
      RequiredHashUrl.buildHash();

      // @ts-expect-error buildSearch requires required fields without defaults.
      RequiredSearchUrl.buildSearch({ tab: 'settings' });

      // @ts-expect-error replaceSearch requires complete required search state.
      RequiredSearchUrl.replaceSearch('/users/1?page=1', { tab: 'settings' });

      // @ts-expect-error static descriptors also enforce required search fields in build input.
      StaticRouteUrl.build({ params: { slug: 'post-1' }, search: { sort: 'popular' } });

      expectType<
        UrlBuildInput<'path', { readonly id: number }, { readonly tab?: string }, undefined>
      >({ params: { id: 1 } });
      expectType<UrlBuildInput<'path', {}, { readonly q: string }, undefined>>({
        search: { q: 'router' },
      });
      expectType<UrlBuildInput<'pathless', {}, { readonly page: number }, undefined>>({
        pathname: '/products',
        search: { page: 2 },
      });
    }
  });

  it('uses mode-aware normalize inputs and preserves pathless literal pathnames', () => {
    const UserUrl = url({ path: '/users/{id:int}', search: { tab: string().optional() } });
    const SearchUrl = url({ path: '/search', search: { q: string() } });
    const FiltersUrl = url({ search: { page: int().default(1) } });
    const RequiredSearchUrl = url({
      path: '/users/{id:int}',
      search: {
        tab: string().default('profile'),
        page: int(),
      },
    });
    const RequiredHashUrl = url({
      path: '/docs',
      hash: enumOf(['overview', 'comments'] as const),
    });
    const OptionalHashUrl = url({
      path: '/docs',
      hash: enumOf(['overview', 'comments'] as const).optional(),
    });
    const DefaultHashUrl = url({
      path: '/docs',
      hash: enumOf(['overview', 'comments'] as const).default('overview'),
    });

    const pathlessState = FiltersUrl.parse('/products?page=2');
    const literalState = FiltersUrl.normalize({ pathname: '/products', search: { page: 2 } });

    expectType<string>(pathlessState.pathname);
    expectType<'/products'>(literalState.pathname);

    UserUrl.normalize({ params: { id: 1 }, search: { tab: 'profile' } });
    SearchUrl.normalize({ search: { q: 'router' } });
    FiltersUrl.normalize({ pathname: '/products', search: { page: 2 } });
    RequiredSearchUrl.normalize({ params: { id: 1 }, search: { page: 1 } });
    RequiredHashUrl.normalize({ hash: 'overview' });
    OptionalHashUrl.normalize({});
    DefaultHashUrl.normalize({});

    if (false) {
      // @ts-expect-error path-based normalize accepts params, not pathname.
      UserUrl.normalize({ pathname: '/users/1', params: { id: 1 } });

      // @ts-expect-error path params are required for path-based normalize with params.
      UserUrl.normalize({ search: { tab: 'profile' } });

      // @ts-expect-error pathless normalize rejects params.
      FiltersUrl.normalize({ params: {} });

      // @ts-expect-error required search fields without defaults must be present in normalize input.
      RequiredSearchUrl.normalize({ params: { id: 1 }, search: { tab: 'settings' } });

      // @ts-expect-error required search fields make the normalize search object itself required.
      RequiredSearchUrl.normalize({ params: { id: 1 } });

      // @ts-expect-error required hash fields without defaults must be present in normalize input.
      RequiredHashUrl.normalize({});

      expectType<
        UrlNormalizeInput<'path', { readonly id: number }, { readonly tab?: string }, undefined>
      >({ params: { id: 1 } });
      expectType<UrlNormalizeInput<'path', {}, { readonly q: string }, undefined>>({
        search: { q: 'router' },
      });
      expectType<UrlNormalizeInput<'pathless', {}, { readonly page: number }, undefined>>({
        pathname: '/products',
        search: { page: 2 },
      });
    }
  });

  it('keeps path methods unavailable for pathless contracts', () => {
    const UserUrl = url({ path: '/users/{id:int}' });
    const FiltersUrl = url({ search: { page: int().default(1) } });

    expectType<(pathname: string) => { readonly id: number }>(UserUrl.parsePathname);
    expectType<(params: { readonly id: number }) => string>(UserUrl.buildPath);
    expectType<never>(FiltersUrl.parsePathname);
    expectType<never>(FiltersUrl.buildPath);

    if (false) {
      UserUrl.parsePathname('/users/1');
      UserUrl.buildPath({ id: 1 });

      // @ts-expect-error pathless contracts do not expose parsePathname.
      FiltersUrl.parsePathname('/products');

      // @ts-expect-error pathless contracts do not expose buildPath.
      FiltersUrl.buildPath({});
    }
  });
});
