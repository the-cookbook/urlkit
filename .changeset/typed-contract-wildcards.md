---
'@cookbook/urlkit': patch
---

Fix contract-level `pathMatch.wildcardFormat` type inference for wildcard params.

Contract-level `pathMatch` options now affect inferred params for `parse`, `safeParse`, `parseRequest`, `safeParseRequest`, and `parsePathname`, while method-level options remain the precedence override. Router-runtime wildcard inference now preserves raw versus parsed parameter modes, and `compilePath().matchPathname()` now applies contract-level path-match options consistently.
