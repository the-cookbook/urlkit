# @cookbook/urlkit examples

Focused examples for the implemented public API.

## Basic path-based contract

```ts
import { enumOf, int, url } from '@cookbook/urlkit';

const UserUrl = url({
  path: '/users/{id:int}',
  search: {
    page: int().default(1),
  },
  hash: enumOf(['activity', 'comments']).optional(),
});

const state = UserUrl.parse('/users/42?page=2#activity');

UserUrl.build({
  params: { id: state.params.id },
  search: { page: state.search.page + 1 },
  hash: state.hash,
});
// '/users/42?page=3#activity'
```

## Custom path constraints

```ts
import { createPathConstraint, registerPathConstraint, url } from '@cookbook/urlkit';

const slug = createPathConstraint({
  parse(paramName, value) {
    if (!/^[a-z0-9-]+$/.test(String(value))) {
      throw new Error(`Path parameter "${paramName}" must be a slug.`);
    }
  },
  verify(_paramName, params) {
    if (params.trim()) {
      throw new Error('Slug constraint does not accept arguments.');
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

ArticleUrl.parse('/articles/custom-paths').params.slug;
// string

ArticleUrl.match('/articles/InvalidSlug');
// false
```

## Optional and chained path constraints

```ts
import { url } from '@cookbook/urlkit';

const ProductUrl = url({
  path: '/products/{id:min(1):max(10)?}',
});

ProductUrl.parse('/products').params;
// {}

ProductUrl.parse('/products/2.5').params.id;
// number | undefined

ProductUrl.build({});
// '/products'

const ArticleUrl = url({
  path: '/articles/{slug:minlength(3):maxlength(50)?}',
});

ArticleUrl.parse('/articles/hello').params.slug;
// string | undefined
```

See [`examples/optional-path-params.ts`](../examples/optional-path-params.ts) for optional params, chained numeric constraints, UUIDs, and length constraints.

## Path match options

Use `pathMatch` to set shared path options.

```ts
import { url } from '@cookbook/urlkit';

const ApiUrl = url({ path: '/api' }, { pathMatch: { end: false } });

ApiUrl.parse('/api/users').pathname;
// '/api'
```

Per-call options override shared options.

```ts
ApiUrl.match('/api/users', { end: true });
// false
```

Wildcard params are strings by default.

```ts
const FileUrl = url({ path: '/files/{*path}' });

FileUrl.parse('/files/docs/readme').params;
// { path: 'docs/readme' }
```

Use `wildcardFormat: 'array'` to return wildcard params as path segments.

```ts
FileUrl.parse('/files/docs/readme', { wildcardFormat: 'array' }).params;
// { path: ['docs', 'readme'] }
```

Use `decode: true` to decode path params with `decodeURIComponent`.

```ts
const UserUrl = url({ path: '/users/{name}' });

UserUrl.parse('/users/John%20Doe', { decode: true }).params;
// { name: 'John Doe' }
```

Use a custom decoder when path params need app-specific decoding.

```ts
UserUrl.parse('/users/John-Doe', {
  decode: (value) => value.replaceAll('-', ' '),
}).params;
// { name: 'John Doe' }
```

## Pathless search contract

```ts
import { int, search, string } from '@cookbook/urlkit';

const ProductSearch = search({
  category: string().optional(),
  page: int().default(1),
});

ProductSearch.parse('/products?page=2');

ProductSearch.build({ search: { page: 2 } });
// '?page=2'

ProductSearch.build({ pathname: '/products', search: { page: 2 } });
// '/products?page=2'
```

## Comma-separated array search params

```ts
import { array, search, string } from '@cookbook/urlkit';

const Tags = search(
  {
    tags: array(string()).optional(),
  },
  { arrayFormat: 'comma' },
);

Tags.parse('/products?tags=ts%2Crouter').search.tags;
// ['ts', 'router']

Tags.safeParse('/products?tags=ts%2Crouter').success;
// true

Tags.build({ search: { tags: ['ts', 'router'] } });
// '?tags=ts%2Crouter'

Tags.build({ search: { tags: ['ts', 'router'] } }, { arrayFormat: 'repeat' });
// '?tags=ts&tags=router'
```

## Pathless hash contract

```ts
import { enumOf, hash } from '@cookbook/urlkit';

const DocsHash = hash(enumOf(['intro', 'api']).optional());

DocsHash.parse('/docs#api');
DocsHash.build({ hash: 'api' });
// '#api'
```

## Search defaults include/omit

```ts
import { int, search } from '@cookbook/urlkit';

const Paging = search({
  page: int().default(1),
});

Paging.build({ search: { page: 1 } });
// '?page=1'

Paging.build({ search: { page: 1 } }, { defaults: 'omit' });
// ''
```

## Unknown search strip/preserve/error

```ts
import { search, string } from '@cookbook/urlkit';

const Query = search({
  q: string(),
});

Query.parse('/search?q=router&debug=true');
// { search: { q: 'router' }, hash: undefined, ... }

Query.parse('/search?q=router&debug=true', { unknownSearch: 'preserve' }).unknownSearch;
// { debug: 'true' }

Query.safeParse('/search?q=router&debug=true', { unknownSearch: 'error' }).success;
// false
```

## Object search with escaped keys

```ts
import { boolean, object, search, string } from '@cookbook/urlkit';

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

Filters.parse('/users?filter.user%7E1name=Ada').search.filter['user.name'];
// 'Ada'
```

## Date-only field

```ts
import { date, search } from '@cookbook/urlkit';

const Reports = search({
  day: date(),
});

const state = Reports.parse('/reports?day=2026-06-02');
state.search.day.toISOString();
// '2026-06-02T00:00:00.000Z'
```

## dateTime field

```ts
import { dateTime, search } from '@cookbook/urlkit';

const Events = search({
  at: dateTime(),
});

Events.parse('/events?at=2026-01-01T10:30:00.000Z');
```

Ambiguous or offset values such as `2026-01-01T10:30:00` and `2026-01-01T10:30:00+02:00` are invalid. Use `dateTime({ format: 'dd-MM-yyyy HH:mm:ss' })` for strict custom runtime date-time format strings, or `dateTime({ format: { parse, serialize } })` for fully custom codecs.

## Unix date field

```ts
import { date, search } from '@cookbook/urlkit';

const Imported = search({
  createdAt: date({ format: 'unix-seconds' }),
});

Imported.parse('/imports?createdAt=1704067200').search.createdAt;
```

## Custom runtime date and date-time format strings

```ts
import { date, dateTime, search } from '@cookbook/urlkit';

const Reports = search({
  from: date({ format: 'dd-MM-yyyy' }),
  at: dateTime({ format: 'dd-MM-yyyy HH:mm:ss' }).optional(),
});

Reports.build({
  search: {
    from: new Date('2026-06-02T00:00:00.000Z'),
    at: new Date('2026-06-02T12:30:05.000Z'),
  },
});
// '?from=02-06-2026&at=02-06-2026+12%3A30%3A05'
```

Supported tokens are `yyyy`, `MM`, `dd`, `HH`, `mm`, `ss`, and `SSS`. Unsupported third-party format tokens such as `DD`, `YYYY`, locale month names, and timezone names are rejected.

Custom format strings are runtime-only and cannot be used in static descriptors.

## Custom runtime date and date-time codecs

```ts
import { date, dateTime, search } from '@cookbook/urlkit';

const Reports = search({
  from: date({
    format: {
      parse(value) {
        const [day, month, year] = value.split('-');
        return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
      },
      serialize(value) {
        const day = String(value.getUTCDate()).padStart(2, '0');
        const month = String(value.getUTCMonth() + 1).padStart(2, '0');
        return `${day}-${month}-${value.getUTCFullYear()}`;
      },
    },
  }),
  at: dateTime({
    format: {
      parse(value) {
        return new Date(value);
      },
      serialize(value) {
        return value.toISOString();
      },
    },
  }).optional(),
});
```

Custom codecs are runtime-only and cannot be used in static descriptors.

## Static descriptor compilation

```ts
import { compileStaticUrl } from '@cookbook/urlkit/static';

const compiled = compileStaticUrl({
  path: '/search',
  search: {
    q: { type: 'string' },
    page: { type: 'int', default: 1 },
    sort: {
      type: 'enum',
      values: ['newest', 'popular'],
      default: 'newest',
    },
  },
  hash: { type: 'enum', values: ['results', 'filters'], optional: true },
} as const);

compiled.pattern;
// '/search'
```

## Router-runtime `createRouteUrlContract`

```ts
import { createRouteUrlContract } from '@cookbook/urlkit/router-runtime';

const ArticleUrl = createRouteUrlContract({
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
} as const);

ArticleUrl.parse(
  '/articles/post-1?ref=email&publishedOn=02-06-2026&scheduledAt=02-06-2026+12%3A30%3A05#comments',
);

ArticleUrl.safeParse('/articles/post-1?ref=email&publishedOn=02-06-2026&scheduledAt=foo#comments', {
  invalidSearch: 'omit',
});
```

Router-runtime params default to raw strings. Use `{ params: 'parsed' }` to parse numeric PathKit constraints such as `int`, `decimal`, and `range`.

## `parseRequest` and `safeParseRequest`

```ts
import { int, url } from '@cookbook/urlkit';

const UserUrl = url({
  path: '/users/{id:int}',
  search: {
    page: int().default(1),
  },
});

UserUrl.parseRequest(new Request('https://example.com/users/42?page=2'));

const result = UserUrl.safeParseRequest(
  { url: '/users/42?page=2' },
  { baseUrl: 'https://example.com' },
);

if (result.success) {
  result.data.params.id;
}
```

## `safeParse` and `safeNormalize` error handling

```ts
import { UrlKitError, int, url } from '@cookbook/urlkit';

const UserUrl = url({
  path: '/users/{id:int}',
  search: {
    page: int().default(1),
  },
});

const parsed = UserUrl.safeParse('/users/not-a-number');

if (!parsed.success) {
  parsed.error instanceof UrlKitError;
  parsed.error.code;
}

const normalized = UserUrl.safeNormalize({
  params: { id: 'wrong' as never },
});

if (!normalized.success) {
  normalized.error.code;
}
```

## Real-world framework integrations

The repository includes product catalog examples under `examples/integrations/`. They all consume the same shared URLKit contracts and mock product data:

```txt
examples/integrations/shared
examples/integrations/nextjs
examples/integrations/express
examples/integrations/hono
examples/integrations/fastify
examples/integrations/react-router
examples/integrations/remix
examples/integrations/tanstack-router
```

The shared product catalog demonstrates:

- typed search filters with pagination, sorting, booleans, arrays, and object search
- repeated-key and comma-separated array formats
- custom PathKit path constraints for product slugs
- hash links for product detail sections
- request parsing with `safeParseRequest`
- route-param normalization with `safeNormalize`
- canonical href generation with `build`

Example shared contract usage:

```ts
import { ProductDetailsUrl, ProductFiltersUrl } from '../shared/url-contracts';

const parsed = ProductFiltersUrl.safeParse('/products?tags=sale&tags=leather&page=2');

const nextPageHref = ProductFiltersUrl.build(
  {
    search: {
      tags: ['sale', 'leather'],
      page: 3,
    },
  },
  { defaults: 'omit' },
);

const reviewsHref = ProductDetailsUrl.build({
  params: { slug: 'red-wing-iron-ranger' },
  hash: 'reviews',
});
```
