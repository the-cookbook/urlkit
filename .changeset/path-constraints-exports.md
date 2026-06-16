---
'@cookbook/urlkit': minor
---

Re-export Pathkit constraint helpers with URLKit-friendly names:

- `hasConstraint` as `hasPathConstraint`
- `getConstraint` as `getPathConstraint`
- `pathkitCreateConstraint` as `createPathConstraint`
- `resetConstraints` as `resetPathConstraints`
- `unregisterConstraint` as `unregisterPathConstraint`

Deprecate `createConstraint` in favor of `createPathConstraint`.

> `createConstraint` is set to be removed in v3.
