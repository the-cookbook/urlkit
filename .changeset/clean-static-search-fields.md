---
'@cookbook/urlkit': major
---

Clean up static URL definitions to remove duplicated and ambiguous descriptor shapes.

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
