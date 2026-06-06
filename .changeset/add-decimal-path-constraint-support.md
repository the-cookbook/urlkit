---
'@cookbook/urlkit': minor
---

Add support for PathKit's `decimal` path constraint in URL contracts.

URLKit now treats `{param:decimal}` as a numeric path parameter during parsing, normalization, matching, and URL building. This lets contracts model decimal path values directly, while `{param:int}` continues to represent integer-only path values.

This release also removes stale handling for the unsupported `{param:number}` constraint, so URLKit's path inference and validation now match the constraints exposed by `@cookbook/pathkit`.

Invalid constrained path params are now classified more accurately as `invalid-param` when the pathname shape matches but a path parameter fails its declared constraint.
