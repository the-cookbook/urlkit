# TanStack Router URLKit integration

This example keeps TanStack Router routes responsible for navigation while URLKit owns URL state contracts.

- Product routes validate URL state with `ProductFiltersUrl` and `ProductDetailsUrl`.
- Links are generated from URLKit contracts to avoid manually assembling query strings and hashes.

> Local development note: the example depends on `@cookbook/urlkit` through `file:../../..`, so build the root package first when running it from this repository.

## Run

```sh
npm install
npm run dev
```
