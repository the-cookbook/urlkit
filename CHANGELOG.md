# @cookbook/urlkit

## 2.0.0

### Major Changes

- ff79d35: Clean up static URL definitions to remove duplicated and ambiguous descriptor shapes.

  Static search fields now use direct `{ type: ... }` descriptors. The `type` property always means value kind, and repeated query params are declared with `many: true`.

  ```ts
  const descriptor = {
    search: {
      page: { type: 'int', default: 1 },
      tag: { type: 'string', many: true, optional: true },
      sort: { type: 'enum', values: ['newest', 'popular'], default: 'newest' },
      publishedOn: { type: 'date', format: 'dd-MM-yyyy', optional: true },
      scheduledAt: { type: 'date-time', format: 'dd-MM-yyyy HH:mm:ss', optional: true },
    },
    hash: { type: 'enum', values: ['comments', 'share'], optional: true },
  } as const satisfies StaticUrlDescriptor;
  ```

  Breaking changes:
  - Static search no longer supports string shorthand fields like `q: 'string'`.
  - Static search no longer supports primitive `{ value: 'int' }` fields.
  - Static search no longer supports cardinality encoded as `{ type: 'many', value: 'string' }`; use `{ type: 'string', many: true }`.
  - Static search no longer supports nested rich `value` descriptors; use direct `{ type: 'enum' }`, `{ type: 'date' }`, or `{ type: 'date-time' }` descriptors.
  - Static date and date-time search formats reject runtime `{ parse, serialize }` codecs; static descriptors support strings only.
  - Static hash no longer supports array shorthand like `hash: ['comments', 'share']`; use `{ type: 'enum', values: ['comments', 'share'], optional: true }`.
  - Static `optional` and `many` flags must be literal `true` when present; false flags are invalid.
  - Static search and hash descriptors now reject `optional: true` combined with `default`.
  - Router-runtime descriptors use the same cleaned static descriptor API.
  - `StaticUrlDescriptor` is exported for `as const satisfies StaticUrlDescriptor` validation without widening literals.
  - `RouteUrlContract` is exported for typing contracts created by `createRouteUrlContract()`.

  Additional hardening:
  - `match()` now returns `false` only for expected `UrlKitError` validation failures and rethrows unexpected non-UrlKit errors instead of hiding delegated failures.
  - PathKit integration tests now assert that delegated PathKit failures are preserved through `UrlKitError.cause`.
  - Router-runtime examples and tests now assert exact safe failure codes and paths for broken states, config overrides, and recovery behavior.

### Minor Changes

- e284af7: Add partial router-runtime parsing for invalid optional URL entries.

  `parseSearch` and URL contract parsing now support `invalidSearch: 'omit'` to keep valid declared search fields while omitting invalid optional/defaulted fields. Strict parsing remains the default with `invalidSearch: 'error'`.

  `parseHash` also supports `invalidHash: 'omit'` for optional/defaulted hash descriptors, allowing invalid hash values to be treated as absent while required hashes remain strict.

  Static date and date-time search descriptors now use the direct router-friendly shape `{ type, format, optional, default }`. Nested `value` wrappers for custom date and date-time descriptors are rejected so static route descriptors stay consistent.

  Contract-level `parseSearch` also now extracts query params from serialized paths and URLs before parsing, so callers can pass `/articles/1?page=2` as well as `?page=2`.

## 1.2.0

### Minor Changes

- 80e4d8c: Add strict custom date and date-time format strings to runtime schema builders.

  `date({ format: 'dd-MM-yyyy' })` now parses and serializes custom date-only strings using URLKit's supported token subset, while `dateTime({ format: 'dd-MM-yyyy HH:mm:ss' })` supports custom date-time strings. Supported tokens are `yyyy`, `MM`, `dd`, `HH`, `mm`, `ss`, and `SSS`; parsing is strict and validates real UTC calendar dates and instants.

  Existing built-in date formats and explicit `{ parse, serialize }` runtime codecs remain supported. Static descriptors continue to use built-in serialized date formats only.

### Patch Changes

- 80490aa: Preserve PathKit constraint validation details when path params fail validation.

  URLKit now wraps PathKit constraint failures as `UrlKitError` instances with code `invalid-param` while preserving the original constraint error as `cause`. The generated error message also includes the underlying constraint failure message when available.

  This makes path validation failures easier to debug without changing URLKit's public error shape.

## 1.1.0

### Minor Changes

- 45a4b93: Add support for PathKit's `decimal` path constraint in URL contracts.

  URLKit now treats `{param:decimal}` as a numeric path parameter during parsing, normalization, matching, and URL building. This lets contracts model decimal path values directly, while `{param:int}` continues to represent integer-only path values.

  This release also removes stale handling for the unsupported `{param:number}` constraint, so URLKit's path inference and validation now match the constraints exposed by `@cookbook/pathkit`.

  Invalid constrained path params are now classified more accurately as `invalid-param` when the pathname shape matches but a path parameter fails its declared constraint.

## 1.0.0

### Major Changes

- 8a6136c: Initial public release of `@cookbook/urlkit`.

  This release introduces framework-agnostic typed URL contracts for parsing, validating, normalizing, matching, and building URL state across browser, server, edge, router, CLI, and test environments.

  Included capabilities:
  - Runtime URL contracts through `url`, `search`, and `hash`.
  - Static descriptor compilation through `@cookbook/urlkit/static`.
  - Router-runtime helpers through `@cookbook/urlkit/router-runtime`.
  - Path-based and pathless URL contracts.
  - Typed path params, search params, hash fragments, unknown search handling, and request parsing.
  - Runtime schema builders for strings, numbers, integers, booleans, enums, arrays, objects, dates, date-times, Unix timestamps, and custom date codecs.
  - Configurable search array formats with repeated-key and comma-separated serialization.
  - Defaulted values with include/omit serialization behavior.
  - Object search hydration and deterministic dotted-key escaping.
  - Optional, required, enum, and defaulted hash support.
  - Safe parse and safe normalize APIs returning discriminated result objects.
  - Custom PathKit path constraints via `createConstraint`, `registerPathConstraint`, `registerPathConstraints`, and per-contract `pathConstraints`.
  - Public `UrlKitError` with stable error codes for validation and descriptor failures.
  - Real-world framework integration examples for Next.js, Express, Hono, Fastify, React Router, Remix, and TanStack Router.
  - Shared product catalog integration contracts demonstrating typed filters, pagination, product detail routes, hash links, and custom slug constraints.
  - Middleware-style URLKit validation examples for Express, Hono, and Fastify.
  - Example app styling, conditional pagination rendering, and framework-specific module resolution setup.
