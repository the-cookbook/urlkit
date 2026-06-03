---
'@cookbook/urlkit': minor
---

Initial public release of `@cookbook/urlkit`.

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
