# @cookbook/urlkit examples

These examples show practical, framework-agnostic usage of `@cookbook/urlkit` from application code.
They import only public package entry points and avoid React, Express, Hono, Fastify, route trees, loaders, middleware, and framework adapters.

## Running the examples

The example files are included in the TypeScript project, so `npm run typecheck` validates them.
Representative examples are also executed by the test suite.

```sh
npm install
npm run typecheck
npm test
npm run build
```

## Example files

| File                                             | Demonstrates                                                                                                         |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| [`basic-usage.ts`](./basic-usage.ts)             | Path-based `url()`, path params, search params, `parse`, `build`, and `match`.                                       |
| [`search-filters.ts`](./search-filters.ts)       | Pathless contracts, enums, arrays, comma array format, booleans, defaults, suffix building, full-path building, unknown search behavior. |
| [`server-request.ts`](./server-request.ts)       | `parseRequest`, `safeParseRequest`, web-standard `Request`, request-like `{ url: string }`, and `baseUrl`.           |
| [`router-runtime.ts`](./router-runtime.ts)       | `createRouteUrlContract`, raw params by default, parsed params opt-in, and router-runtime search helpers.            |
| [`static-descriptor.ts`](./static-descriptor.ts) | Static URL/search/hash descriptors that remain analyzable by router tooling.                                         |
| [`object-search.ts`](./object-search.ts)         | Declared object search fields, nested parsing/building, dot notation, escaped keys, and collision-safe parsing.      |
| [`date-search.ts`](./date-search.ts)             | `date()`, `dateTime()`, unix seconds, unix milliseconds, and custom runtime date codecs.                             |
| [`error-handling.ts`](./error-handling.ts)       | `UrlKitError`, `safeParse`, `safeNormalize`, error-code checks, and default include/omit behavior.                   |

## More documentation

- [Main README](../README.md)
- [API reference](../docs/api.md)
- [Additional examples](../docs/examples.md)
