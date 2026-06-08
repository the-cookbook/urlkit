---
'@cookbook/urlkit': patch
---

Restore clean static search descriptor shorthand support.

Static search descriptors now accept the documented concise forms used by router-runtime definitions, including primitive shorthand fields such as `q: 'string'`, value-wrapper fields such as `page: { value: 'int', default: 1 }`, and enum value wrappers such as `sort: { value: { type: 'enum', values: ['newest', 'popular'] }, default: 'newest' }`.

The explicit `{ type, many, optional, default }` form remains supported. Ambiguous descriptors that combine `value` and `type` in the same field are rejected with `invalid-descriptor`.
