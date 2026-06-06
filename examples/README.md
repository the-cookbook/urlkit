# @cookbook/urlkit examples

These examples show practical, framework-agnostic usage of `@cookbook/urlkit` from application code.
The root example files import only public package entry points and avoid framework dependencies. Framework-specific examples live under `examples/integrations/*` with their own `package.json` files so the library test suite does not need to install Next.js, Express, Hono, Fastify, React Router, Remix, or TanStack Router.

## Running the examples

The example files are included in the TypeScript project, so `npm run typecheck` validates them.
Representative root examples are also executed by the test suite. The shared integration contracts and mock product data are covered by `src/integration-examples.test.ts`.

```sh
npm install
npm run typecheck
npm test
npm run build
```

## Example files

| File                                                         | Demonstrates                                                                                                                                    |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| [`basic-usage.ts`](./basic-usage.ts)                         | Path-based `url()`, path params, search params, `parse`, `build`, and `match`.                                                                  |
| [`search-filters.ts`](./search-filters.ts)                   | Pathless contracts, enums, arrays, comma array format, booleans, defaults, suffix building, full-path building, unknown search behavior.        |
| [`custom-path-constraints.ts`](./custom-path-constraints.ts) | Global and per-contract PathKit custom path constraints through URLKit.                                                                         |
| [`server-request.ts`](./server-request.ts)                   | `parseRequest`, `safeParseRequest`, web-standard `Request`, request-like `{ url: string }`, and `baseUrl`.                                      |
| [`router-runtime.ts`](./router-runtime.ts)                   | `createRouteUrlContract`, raw params by default, parsed params opt-in, router-runtime search helpers, and static date/date-time format strings. |
| [`static-descriptor.ts`](./static-descriptor.ts)             | Static URL/search/hash descriptors that remain analyzable by router tooling.                                                                    |
| [`object-search.ts`](./object-search.ts)                     | Declared object search fields, nested parsing/building, dot notation, escaped keys, and collision-safe parsing.                                 |
| [`date-search.ts`](./date-search.ts)                         | `date()`, `dateTime()`, unix seconds, unix milliseconds, custom format strings, and custom runtime date codecs.                                 |
| [`error-handling.ts`](./error-handling.ts)                   | `UrlKitError`, `safeParse`, `safeNormalize`, error-code checks, and default include/omit behavior.                                              |

## Framework integration examples

| Directory                                                        | Demonstrates                                                            |
| ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| [`integrations/shared`](./integrations/shared)                   | Shared product URL contracts, mock data, and HTML render helpers.       |
| [`integrations/nextjs`](./integrations/nextjs)                   | App Router pages and route handlers using URLKit.                       |
| [`integrations/express`](./integrations/express)                 | Express middleware that validates request URLs with URLKit contracts.   |
| [`integrations/hono`](./integrations/hono)                       | Hono middleware that validates `context.req.raw` with URLKit contracts. |
| [`integrations/fastify`](./integrations/fastify)                 | Fastify pre-handlers that validate request URLs with URLKit contracts.  |
| [`integrations/react-router`](./integrations/react-router)       | React Router loaders and URLKit-built links.                            |
| [`integrations/remix`](./integrations/remix)                     | Remix loaders and URLKit-built product links.                           |
| [`integrations/tanstack-router`](./integrations/tanstack-router) | TanStack Router route modules with URLKit-owned URL state.              |

## More documentation

- [Main README](../README.md)
- [API reference](../docs/api.md)
- [Additional examples](../docs/examples.md)
