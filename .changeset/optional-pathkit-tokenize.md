---
'@cookbook/urlkit': patch
---

Fix optional path params so trailing `?` markers are treated as parameter optionality rather than part of constraint names.

Runtime path parsing now preserves optional and wildcard metadata from PathKit `tokenize` output, while generated URLKit types infer optional constrained and unconstrained params correctly. Built-in numeric constraints such as `{id:int?}` infer `id?: number`, custom constraints such as `{slug:slug?}` infer optional strings, and generated pathnames include both omitted and present shapes such as `/products | /products/${number}`.

Also updates path build/normalize input typing so contracts whose path params are all optional can build or normalize without a `params` object, and adds regression tests, usage examples, API docs, and troubleshooting guidance for optional path params.
