# @cookbook/urlkit

[![npm version](https://img.shields.io/npm/v/@cookbook/urlkit.svg)](https://www.npmjs.com/package/@cookbook/urlkit)
[![npm downloads](https://img.shields.io/npm/dm/@cookbook/urlkit.svg)](https://www.npmjs.com/package/@cookbook/urlkit)
[![Bundle size](https://img.shields.io/bundlephobia/minzip/@cookbook/urlkit)](https://bundlephobia.com/package/@cookbook/urlkit)
[![CI](https://github.com/the-cookbook/urlkit/actions/workflows/ci.yml/badge.svg)](https://github.com/the-cookbook/urlkit/actions/workflows/ci.yml)

Framework-agnostic typed URL contracts for parsing, validating, normalizing, matching, and building URL state.

URLKit owns typed URL state: path params, search params, hash fragments, request parsing, URL normalization, matching, and href building. It sits between `@cookbook/pathkit` and higher-level router packages, but it does not define routes, route IDs, route trees, loaders, middleware, React hooks, components, or framework adapters.

## Documentation

- [Full API reference](./docs/api.md)
- [Focused examples](./docs/examples.md)
- [Troubleshooting](./docs/troubleshooting.md)
- [Release readiness notes](./release-readiness.md)

## Real-world framework examples

Full integration examples are available under [`examples/integrations`](./examples/integrations). They show the same product catalog contracts used with Next.js, Express, Hono, Fastify, React Router, Remix, and TanStack Router, including local Express/Hono/Fastify middleware wrappers that accept a URLKit contract plus options.

## Table of contents

- [Documentation](#documentation)
- [Real-world framework examples](#real-world-framework-examples)
- [Installation](#installation)
- [Quick start](#quick-start)
- [Why URLKit?](#why-urlkit)
- [Package exports](#package-exports)
- [Core concepts](#core-concepts)
  - [`parse`, `normalize`, `build`, and `match`](#parse-normalize-build-and-match)
  - [`UrlState`](#urlstate)
  - [Path-based vs pathless contracts](#path-based-vs-pathless-contracts)
- [Path-based URL contracts](#path-based-url-contracts)
  - [Custom path constraints](#custom-path-constraints)
- [Pathless URL contracts](#pathless-url-contracts)
  - [Search-only helper](#search-only-helper)
  - [Hash-only helper](#hash-only-helper)
- [Search params](#search-params)
- [Unknown search params](#unknown-search-params)
- [Defaults behavior](#defaults-behavior)
- [Dates](#dates)
- [Object search](#object-search)
- [Hash](#hash)
- [Safe APIs](#safe-apis)
- [Request parsing](#request-parsing)
- [Static descriptors](#static-descriptors)
- [Router-runtime usage](#router-runtime-usage)
- [Error handling](#error-handling)
- [TypeScript inference](#typescript-inference)
- [Framework boundary](#framework-boundary)
- [Testing and development](#testing-and-development)

## Installation

```sh
pnpm add @cookbook/urlkit
npm install @cookbook/urlkit
yarn add @cookbook/urlkit
```

## Quick start

```ts
import { int, string, url } from '@cookbook/urlkit';

const UserUrl = url({
  path: '/users/{id:int}',
  search: {
    tab: string().default('profile'),
    page: int().default(1),
  },
});

const state = UserUrl.parse('/users/42?tab=settings&page=2');
// state.params.id: number
// state.search.tab: string

const href = UserUrl.build({
  params: { id: 42 },
  search: { tab: 'settings', page: 2 },
});
// '/users/42?tab=settings&page=2'
```

## Why URLKit?

URLs usually cross boundaries as strings, but application code wants typed state. URLKit gives you one reusable contract for:

- parsing serialized URLs into typed state
- normalizing structured params/search/hash from framework or server inputs
- building canonical URLs from typed state
- validating and matching URLs without routing dependencies
- sharing the same URL contract across browser, server, edge, router, CLI, and test environments

## Package exports

| Import path                       | Purpose                                                                      |
| --------------------------------- | ---------------------------------------------------------------------------- |
| `@cookbook/urlkit`                | Runtime URL contracts, schema builders, public contracts, and `UrlKitError`. |
| `@cookbook/urlkit/static`         | Static descriptor compilers for router-compatible analyzable descriptors.    |
| `@cookbook/urlkit/router-runtime` | Framework-agnostic runtime helpers for router packages.                      |

```ts
import { url, search, hash, string, int, enumOf } from '@cookbook/urlkit';
import { compileStaticUrl } from '@cookbook/urlkit/static';
import { createRouteUrlContract } from '@cookbook/urlkit/router-runtime';
```

## Core concepts

### `parse`, `normalize`, `build`, and `match`

| Method      | Input                                   | Purpose                                                                   |
| ----------- | --------------------------------------- | ------------------------------------------------------------------------- |
| `parse`     | Serialized URL input: `string` or `URL` | Parse and validate a URL string/object into typed `UrlState`.             |
| `normalize` | Structured URL state                    | Validate/coerce params, search, and hash from application/framework data. |
| `build`     | Typed URL state                         | Serialize state to a canonical URL string.                                |
| `match`     | Serialized URL input: `string` or `URL` | Return `true`/`false` for ordinary URL validation.                        |

`parse` intentionally does **not** accept structured objects. Use `normalize` for structured state.

### `UrlState`

Parsed and normalized state always includes `pathname`, `params`, `search`, and `hash`. Optional hashes are represented as `undefined`; the `hash` property itself is still present.

```ts
interface UrlState<Pathname, Params, Search, Hash> {
  readonly pathname: Pathname;
  readonly params: Params;
  readonly search: Search;
  readonly hash: Hash;
  readonly unknownSearch?: UnknownSearchParams;
}
```

Preserved unknown search params live in `state.unknownSearch`, not in `state.search`.

### Path-based vs pathless contracts

| Mode       | How to create it | Path behavior                               | Build behavior                                                      |
| ---------- | ---------------- | ------------------------------------------- | ------------------------------------------------------------------- |
| Path-based | Provide `path`   | Validates pathnames and infers path params. | Builds from `params`.                                               |
| Pathless   | Omit `path`      | Accepts any pathname.                       | Without `pathname`, returns a suffix like `?page=2` or `#comments`. |

## Path-based URL contracts

Path-based contracts use `@cookbook/pathkit` for path pattern matching/building. URLKit adds typed URL state around those paths.

```ts
import { url } from '@cookbook/urlkit';

const ArticleUrl = url({
  path: '/articles/{slug:regex([a-z0-9-]+)}',
});

const state = ArticleUrl.parse('/articles/post-1');
// state.pathname: `/articles/${string}`
// state.params.slug: string

ArticleUrl.build({ params: { slug: 'post-1' } });
// '/articles/post-1'

ArticleUrl.match('/articles/post-1');
// true

ArticleUrl.match('/users/post-1');
// false
```

Path-based build input uses `params`, not `pathname`:

```ts
ArticleUrl.build({ params: { slug: 'post-1' } });

// Invalid for path-based contracts:
// ArticleUrl.build({ pathname: '/articles/post-1' });
```

Path params are inferred from the pattern. PathKit owns path constraint syntax, matching, and runtime validation. URLKit delegates those concerns to PathKit and only reads PathKit-compatible constraint chains to infer/coerce parsed params.

Built-in PathKit constraint inference in URLKit:

| Constraint          | URLKit parsed param type | Notes                                        |
| ------------------- | ------------------------ | -------------------------------------------- |
| `int`               | `number`                 | Integer values.                              |
| `decimal`           | `number`                 | Decimal numeric values.                      |
| `min(value)`        | `number`                 | Inclusive numeric minimum.                   |
| `max(value)`        | `number`                 | Inclusive numeric maximum.                   |
| `range(min,max)`    | `number`                 | Inclusive numeric range.                     |
| `uuid`              | `string`                 | Canonical hyphenated UUID values.            |
| `minlength(length)` | `string`                 | Minimum string length.                       |
| `maxlength(length)` | `string`                 | Maximum string length.                       |
| `list(a\| b\| c)`   | `string`                 | Exact pipe-separated list values.            |
| `regex(pattern)`    | `string`                 | Raw regex source without `/.../` delimiters. |

Custom PathKit constraints infer `string` unless a numeric built-in constraint also appears in the chain.

```ts
const UserUrl = url({ path: '/users/{id:int}' });

const user = UserUrl.parse('/users/42');
// user.params.id: number
```

Numeric constraints can be used alone or chained with other constraints:

```ts
const ProductUrl = url({ path: '/products/{id:min(1):max(10)?}' });

ProductUrl.parse('/products/2.5').params.id;
// number | undefined

ProductUrl.build({});
// '/products'
```

The `regex` constraint receives raw regex source, not a JavaScript regex literal:

```txt
/posts/{slug:regex(/[a-z0-9-]+/)} // ERROR
/posts/{slug:regex([a-z0-9-]+)}   // CORRECT
```

Inside TypeScript string literals, escape backslashes as needed:

```ts
url({ path: '/scores/{id:regex(\\d):min(1)}' });
```

### Custom path constraints

URLKit re-exports PathKit's `createConstraint` and provides global registration helpers for reusable path constraints. Custom constraints infer `string` params by default unless chained with a numeric constraint. Built-in `int`, `decimal`, `range(...)`, `min(...)`, and `max(...)` infer `number`. When a PathKit constraint rejects a value, URLKit wraps it as `UrlKitError` with `code: 'invalid-param'` and preserves the original PathKit error in `error.cause`.

```ts
import { createConstraint, registerPathConstraint, url } from '@cookbook/urlkit';

const slug = createConstraint({
  parse(paramName, value) {
    if (!/^[a-z0-9-]+$/.test(String(value))) {
      throw new Error(`Path parameter "${paramName}" must be a slug.`);
    }
  },
  verify(paramName, params) {
    if (params.trim()) {
      throw new Error(`Constraint "slug" declared for "${paramName}" does not accept arguments.`);
    }
  },
  toRegExp() {
    return '[a-z0-9-]+';
  },
});

registerPathConstraint('slug', slug);

const ArticleUrl = url({
  path: '/articles/{slug:slug}',
});

ArticleUrl.parse('/articles/hello-world').params.slug;
// string
```

Use per-contract registration when a constraint should be local to a contract or test:

```ts
const ArticleUrl = url({ path: '/articles/{slug:slug}' }, { pathConstraints: { slug } });
```

## Pathless URL contracts

Pathless contracts validate search/hash independently of pathname. `pattern` is `undefined`, `params` is `{}`, and `parse` preserves the input pathname.

```ts
import { int, url } from '@cookbook/urlkit';

const FiltersUrl = url({
  search: {
    page: int().default(1),
  },
});

FiltersUrl.build({
  search: { page: 2 },
});
// '?page=2'

FiltersUrl.build({
  pathname: '/products',
  search: { page: 2 },
});
// '/products?page=2'

FiltersUrl.parse('/anything?page=3').pathname;
// '/anything'
```

### Search-only helper

```ts
import { int, search, string } from '@cookbook/urlkit';

const ProductSearch = search({
  category: string().optional(),
  page: int().default(1),
});

ProductSearch.build({ search: { page: 2 } });
// '?page=2'
```

### Hash-only helper

```ts
import { enumOf, hash } from '@cookbook/urlkit';

const DocsHash = hash(enumOf(['intro', 'api']).optional());

DocsHash.parse('/docs#api').hash;
// 'api'

DocsHash.build({ hash: 'api' });
// '#api'
```

## Search params

Runtime search schemas use builders from the main entry.

```ts
import { array, boolean, enumOf, int, number, string, url } from '@cookbook/urlkit';

const SearchUrl = url({
  path: '/search',
  search: {
    q: string(),
    page: int().default(1),
    score: number().optional(),
    active: boolean().optional(),
    tags: array(string()).optional(),
    sort: enumOf(['newest', 'popular']).default('newest'),
  },
});

SearchUrl.parse('/search?q=url&page=2&active=true&tags=ts&tags=router');

SearchUrl.build({
  search: {
    q: 'url',
    page: 2,
    active: true,
    tags: ['ts', 'router'],
    sort: 'newest',
  },
});
// '/search?q=url&page=2&active=true&tags=ts&tags=router&sort=newest'
```

Arrays parse and serialize as repeated params by default. Pass `{ arrayFormat: 'comma' }` to `url(...)`, `parse`, `safeParse`, `parseRequest`, `safeParseRequest`, `match`, `build`, `parseSearch`, or `buildSearch` to use comma-separated arrays. Per-call options override the contract-level default, so `{ arrayFormat: 'repeat' }` can force repeated keys on a comma-configured contract.

```ts
const TagUrl = url(
  {
    path: '/search',
    search: {
      tags: array(string()).optional(),
    },
  },
  { arrayFormat: 'comma' },
);

TagUrl.parse('/search?tags=ts%2Crouter').search.tags;
// ['ts', 'router']

TagUrl.build({ search: { tags: ['ts', 'router'] } });
// '/search?tags=ts%2Crouter'

TagUrl.build({ search: { tags: ['ts', 'router'] } }, { arrayFormat: 'repeat' });
// '/search?tags=ts&tags=router'
```

## Unknown search params

Unknown search params default to `strip`.

| Behavior   | Result                                          |
| ---------- | ----------------------------------------------- |
| `strip`    | Remove unknown params from typed state.         |
| `preserve` | Put unknown params in `state.unknownSearch`.    |
| `error`    | Throw `UrlKitError` with code `invalid-search`. |

```ts
const QueryUrl = url({
  search: {
    q: string(),
  },
});

QueryUrl.parse('/search?q=router&debug=true');
// search: { q: 'router' }

QueryUrl.parse('/search?q=router&debug=true', { unknownSearch: 'preserve' });
// search: { q: 'router' }
// unknownSearch: { debug: 'true' }

QueryUrl.safeParse('/search?q=router&debug=true', { unknownSearch: 'error' });
// { success: false, error: UrlKitError }
```

## Defaults behavior

`parse` and `normalize` always apply defaults. `build` serializes the values it receives and includes defaults by default.

```ts
const Paging = search({
  page: int().default(1),
});

Paging.parse('/products').search;
// { page: 1 }

Paging.build({ search: { page: 1 } });
// '?page=1'

Paging.build({ search: { page: 1 } }, { defaults: 'omit' });
// ''
```

Default omission compares normalized values, so defaults are compared after the same validation/coercion rules used by the contract.

## Dates

```ts
import { date, dateTime, search } from '@cookbook/urlkit';

const Reports = search({
  day: date(),
  at: dateTime().optional(),
  createdAt: date({ format: 'unix-seconds' }).optional(),
  updatedAt: date({ format: 'unix-ms' }).optional(),
});
```

| Builder                                       | Serialized format                      |
| --------------------------------------------- | -------------------------------------- |
| `date()`                                      | Date-only `YYYY-MM-DD`.                |
| `dateTime()`                                  | Strict UTC `YYYY-MM-DDTHH:mm:ss.sssZ`. |
| `date({ format: 'dd-MM-yyyy' })`              | Strict custom date format string.      |
| `dateTime({ format: 'dd-MM-yyyy HH:mm:ss' })` | Strict custom date-time format string. |
| `date({ format: { parse, serialize } })`      | Custom runtime date codec.             |
| `dateTime({ format: { parse, serialize } })`  | Custom runtime date-time codec.        |
| `date({ format: 'unix-seconds' })`            | Finite integer seconds.                |
| `date({ format: 'unix-ms' })`                 | Finite integer milliseconds.           |

Custom date and date-time format strings are available in runtime-builder schemas and static router descriptors. Supported tokens are `yyyy`, `MM`, `dd`, `HH`, `mm`, `ss`, and `SSS`. Static date defaults use serialized values, not `Date` instances. Static descriptors may use format strings, but not custom `{ parse, serialize }` codecs.

```ts
const CustomDate = search({
  from: date({ format: 'dd-MM-yyyy' }),
  at: dateTime({ format: 'dd-MM-yyyy HH:mm:ss' }).optional(),
});

CustomDate.build({
  search: {
    from: new Date('2026-06-02T00:00:00.000Z'),
    at: new Date('2026-06-02T12:30:05.000Z'),
  },
});
// '?from=02-06-2026&at=02-06-2026+12%3A30%3A05'
```

## Object search

`object(...)` hydrates declared object fields from dotted search keys. Raw search parsing without a schema remains flat.

```ts
import { boolean, object, string, search } from '@cookbook/urlkit';

const Filters = search({
  filter: object({
    role: string().optional(),
    active: boolean().optional(),
    'user.name': string().optional(),
  }),
});

Filters.build({
  search: {
    filter: {
      role: 'admin',
      active: true,
      'user.name': 'Ada',
    },
  },
});
// '?filter.role=admin&filter.active=true&filter.user%7E1name=Ada'
```

Object search key rules:

| Rule             | Behavior                                                                      |
| ---------------- | ----------------------------------------------------------------------------- |
| Declared objects | Only fields declared with `object(...)` hydrate nested object values.         |
| Dot notation     | Object fields serialize as `field.child=value`.                               |
| `~` escaping     | `~` becomes `~0`.                                                             |
| `.` escaping     | `.` becomes `~1`.                                                             |
| URL encoding     | Happens after object-key segment escaping.                                    |
| Collisions       | Ambiguous object/scalar collisions throw `UrlKitError` with `invalid-search`. |

## Hash

Hashes support optional, required, enum, and defaulted values. Parsed and normalized `UrlState` always includes a `hash` property.

```ts
import { enumOf, hash, string, url } from '@cookbook/urlkit';

const OptionalHash = hash(enumOf(['intro', 'api']).optional());
OptionalHash.parse('/docs#api').hash;
// 'api'

const RequiredHash = hash(string().required());
RequiredHash.parse('/docs#overview').hash;
// 'overview'

const DefaultHash = url({
  path: '/docs',
  hash: enumOf(['overview', 'comments']).default('overview'),
});

DefaultHash.parse('/docs').hash;
// 'overview'

DefaultHash.build({ hash: 'overview' }, { defaults: 'omit' });
// '/docs'
```

## Safe APIs

Safe APIs return discriminated result objects instead of throwing for ordinary validation errors.

```ts
const parsed = UserUrl.safeParse('/users/not-a-number');

if (parsed.success) {
  parsed.data.params.id;
} else {
  parsed.error.code;
}

const normalized = UserUrl.safeNormalize({ params: { id: 'wrong' as never } });
const request = UserUrl.safeParseRequest(new Request('https://example.com/users/42'));
```

Safe result shape:

```ts
type SafeResult<Data> =
  | { readonly success: true; readonly data: Data }
  | { readonly success: false; readonly error: UrlKitError };
```

## Request parsing

`parseRequest` and `safeParseRequest` support web-standard `Request` and request-like `{ url: string }` inputs. Use `baseUrl` for relative request-like URLs.

```ts
UserUrl.parseRequest(new Request('https://example.com/users/42?page=2'));

UserUrl.safeParseRequest({ url: '/users/42?page=2' }, { baseUrl: 'https://example.com' });
```

No Express, Hono, Fastify, or framework middleware dependency is required. Framework integrations can pass request URLs or use `normalize` with already-extracted params/search/hash.

## Static descriptors

Static descriptors are for tooling and router-compatible definitions. They must remain statically analyzable, so do not use runtime builders in static route definitions.

Good:

```ts
const searchDescriptor = {
  page: { type: 'int', default: 1 },
  sort: {
    type: 'enum',
    values: ['newest', 'popular'],
    default: 'newest',
  },
} as const;
```

Bad:

```ts
import { int } from '@cookbook/urlkit';

const searchDescriptor = {
  page: int().default(1),
};
```

Compile static descriptors through `@cookbook/urlkit/static`:

```ts
import { compileStaticUrl } from '@cookbook/urlkit/static';

const ProductUrl = compileStaticUrl({
  path: '/products/{id:int}',
  search: searchDescriptor,
  hash: { type: 'enum', values: ['details', 'reviews'], optional: true },
});

ProductUrl.parse('/products/42?sort=popular#details');
```

## Router-runtime usage

`@cookbook/urlkit/router-runtime` contains framework-agnostic helpers for router packages. It does not define routes, route IDs, route trees, loaders, middleware, components, or hooks.

```ts
import {
  buildSearch,
  createRouteUrlContract,
  parseHash,
  parseSearch,
  patchSearch,
} from '@cookbook/urlkit/router-runtime';

const routeDescriptor = {
  path: '/articles/{slug:regex([a-z0-9-]+)}',
  search: {
    ref: { type: 'string', optional: true },
    page: { type: 'int', default: 1 },
    publishedOn: {
      type: 'date',
      format: 'dd-MM-yyyy',
      optional: true,
    },
    scheduledAt: {
      type: 'date-time',
      format: 'dd-MM-yyyy HH:mm:ss',
      optional: true,
    },
  },
  hash: { type: 'enum', values: ['comments', 'share'], optional: true },
} as const;

const ArticleUrl = createRouteUrlContract(routeDescriptor);

ArticleUrl.parse('/articles/post-1?ref=email#comments');
// Router-runtime params default to raw strings.

const parsed = parseSearch('?page=2&publishedOn=02-06-2026', {
  schema: routeDescriptor.search,
});
const partial = ArticleUrl.parseSearch(
  '/articles/post-1?page=2&publishedOn=02-06-2026&scheduledAt=foo',
  {
    invalidSearch: 'omit',
  },
);
const next = buildSearch(
  { page: 3, scheduledAt: new Date('2026-06-02T12:30:05.000Z') },
  { schema: routeDescriptor.search },
);
const patched = patchSearch('?page=2&ref=email', { page: 3 }, { schema: routeDescriptor.search });
const section = parseHash('#comments', routeDescriptor.hash);
const missingSection = parseHash('#overview', routeDescriptor.hash, { invalidHash: 'omit' });
```

Additional router-runtime helpers:

```ts
import {
  buildHash,
  normalizeHash,
  omitSearch,
  pickSearch,
  replaceSearch,
} from '@cookbook/urlkit/router-runtime';
```

Use `{ params: 'parsed' }` with `createRouteUrlContract` when a router wants URLKit to parse numeric PathKit constraints such as `int`, `decimal`, and `range` to numbers.

## Error handling

All URLKit validation and descriptor errors use `UrlKitError`.

```ts
import { UrlKitError } from '@cookbook/urlkit';

try {
  UserUrl.parse('/users/not-a-number');
} catch (error) {
  if (error instanceof UrlKitError) {
    console.log(error.code, error.path);
  }
}
```

| Code                 | Meaning                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------ |
| `invalid-url`        | URL input could not be parsed as a URL.                                                    |
| `path-mismatch`      | URL pathname does not satisfy the path contract.                                           |
| `missing-param`      | Required path param is missing.                                                            |
| `invalid-param`      | Path param is invalid. Constraint failures preserve the original PathKit error in `cause`. |
| `missing-search`     | Required search field is missing.                                                          |
| `invalid-search`     | Search value, unknown search behavior, or object search shape is invalid.                  |
| `invalid-hash`       | Hash value is missing or invalid.                                                          |
| `invalid-descriptor` | Contract/schema/static descriptor is invalid at construction/compile time.                 |

## TypeScript inference

URLKit infers path params, pathnames, search values, and hash values from the contract.

```ts
const UserUrl = url({
  path: '/users/{id:int}',
  search: {
    tab: enumOf(['profile', 'settings']).default('profile'),
  },
  hash: enumOf(['activity', 'comments']).optional(),
});

const state = UserUrl.parse('/users/42?tab=settings#activity');

state.pathname;
// `/users/${number}`

state.params.id;
// number

state.search.tab;
// 'profile' | 'settings'

state.hash;
// 'activity' | 'comments' | undefined
```

Pathless contracts use `pathname: string` because they validate search/hash independently of the path.

```ts
const Query = search({ q: string() });
const state = Query.parse('/anything?q=url');

state.pathname;
// string
```

## Framework boundary

URLKit core is intentionally framework-agnostic:

- no React APIs
- no framework middleware
- no route definitions or route trees
- no loaders/actions
- no Express/Hono/Fastify/Next.js adapters

Router and framework packages can consume URLKit contracts through serialized URLs, `Request`, request-like `{ url: string }`, or structured `normalize` input.

## Testing and development

```sh
pnpm install
npm run typecheck
npm test
npm run build
```

No lint script is currently configured in `package.json`.
