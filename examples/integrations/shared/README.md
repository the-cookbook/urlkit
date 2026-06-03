# Shared URLKit integration contracts

This directory contains the reusable product catalog pieces consumed by every framework example.

- `url-contracts.ts` defines the URLKit contracts.
- `product-data.ts` provides deterministic mock product data and filtering.
- `render-products.ts` provides plain HTML helpers for server-rendered examples.

The important contracts are:

```ts
ProductFiltersUrl.parse('/products?tags=sale&tags=leather&page=2');
ProductFiltersUrl.build({ search: { tags: ['sale', 'leather'], page: 2 } });
ProductDetailsUrl.build({ params: { slug: 'red-wing-iron-ranger' }, hash: 'reviews' });
```

`CommaProductFiltersUrl` demonstrates contract-level comma array serialization while still allowing per-call override back to repeated keys:

```ts
CommaProductFiltersUrl.build({ search: { tags: ['sale', 'leather'] } });
CommaProductFiltersUrl.build({ search: { tags: ['sale', 'leather'] } }, { arrayFormat: 'repeat' });
```

## Local URLKit bridge

`urlkit.ts` re-exports the repository source entrypoint so these examples can run from a fresh checkout before `@cookbook/urlkit` has been built or published.

In a standalone application, replace imports from `./urlkit.js` with:

```ts
import { url, string, int } from '@cookbook/urlkit';
```
