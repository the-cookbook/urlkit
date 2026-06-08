---
'@cookbook/urlkit': patch
---

Improve chained PathKit constraint handling for path params while keeping PathKit as the runtime source of truth.

URLKit now preserves full PathKit constraint chains from `tokenize()` and infers path parameter types from the highest weighted constraint anywhere in the chain. Numeric constraints include `int`, `decimal`, `range(...)`, `min(...)`, and `max(...)`; string constraints such as `regex(...)`, `uuid`, `minlength(...)`, `maxlength(...)`, and custom constraints infer `string` unless combined with a numeric constraint.

Path constraint matching, constraint syntax, and runtime validation remain delegated to PathKit. URLKit only reads the PathKit-compatible constraint chain for inference/coercion after PathKit accepts the path.

The API documentation now explicitly documents PathKit-compatible `regex(...)` syntax: regex patterns must be provided as raw regex sources, without JavaScript `/.../` delimiters. For example, `/posts/{slug:regex([a-z0-9-]+)}` is valid, while `/posts/{slug:regex(/[a-z0-9-]+/)}` is not. In TypeScript string literals, backslashes must still be escaped, such as `'/scores/{id:regex(\\d):min(1)}'`.

This also improves optional constrained path params, generated pathname types, examples, API docs, and regression coverage for chained constraint inference.
