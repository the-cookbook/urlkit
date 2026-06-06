# @cookbook/urlkit

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
