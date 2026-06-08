---
'@cookbook/urlkit': patch
---

Reject undefined path build parameters consistently.

Path build parameter normalization now treats both `undefined` and `null` as missing required path parameter values and throws `UrlKitError` with code `missing-param`, instead of silently omitting `undefined` values before delegating path building.
