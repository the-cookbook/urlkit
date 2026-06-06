---
'@cookbook/urlkit': minor
---

Add partial router-runtime parsing for invalid optional URL entries.

`parseSearch` and URL contract parsing now support `invalidSearch: 'omit'` to keep valid declared search fields while omitting invalid optional/defaulted fields. Strict parsing remains the default with `invalidSearch: 'error'`.

`parseHash` also supports `invalidHash: 'omit'` for optional/defaulted hash descriptors, allowing invalid hash values to be treated as absent while required hashes remain strict.

Static date and date-time search descriptors now use the direct router-friendly shape `{ type, format, optional, default }`. Nested `value` wrappers for custom date and date-time descriptors are rejected so static route descriptors stay consistent.

Contract-level `parseSearch` also now extracts query params from serialized paths and URLs before parsing, so callers can pass `/articles/1?page=2` as well as `?page=2`.
