---
'@cookbook/urlkit': minor
---

Upgrade to `@cookbook/pathkit@1.0.0` and expose configurable path matching for serialized URL input.

Introduce new `pathMatch` property to URL creation options:

```ts
const ApiUrl = url(
  { path: '/api/{*rest}' },
  {
    pathMatch: {
      trailing: true,
      sensitive: false,
      strict: false,
      end: false,
      wildcardFormat: 'array',
      decode: true,
    },
  },
);
```

The same path match options is available to `parse`, `safeParse`, `parseRequest`, `safeParseRequest`, `match`, and `parsePathname`.

`pathMatch` and per-call options support `trailing`, `sensitive`, `strict`, `end`, `wildcardFormat`, and `decode`.

Default URLKit path matching behavior is unchanged. URLKit keeps `/` as the path delimiter, uses PathKit for path matching and path building, and reuses cached matchers. Docs now include examples for path match options, wildcard array params, and path param decoding.
