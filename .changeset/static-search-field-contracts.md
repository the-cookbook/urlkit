---
'@cookbook/urlkit': patch
---

Tighten static search descriptor contracts to the explicit object-only field shape.

Static search fields now use the exported `StaticSearchFieldBase` plus concrete field interfaces such as `StaticStringSearchField`, `StaticIntSearchField`, `StaticDateSearchField`, `StaticDateTimeSearchField`, and `StaticEnumSearchField`. The runtime compiler rejects legacy shorthand forms such as `q: 'string'`, `{ value: 'int' }`, and `{ type: 'many', value: 'string' }` for static descriptors.

Use `many: true` on the typed field instead, for example `{ type: 'string', many: true }`.
