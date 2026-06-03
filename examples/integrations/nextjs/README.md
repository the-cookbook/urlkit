# Next.js URLKit integration

This example uses the App Router to build a product catalog.

URLKit is used in three places:

- `app/products/page.tsx` parses `searchParams` into typed product filters.
- `app/products/[slug]/page.tsx` normalizes dynamic route params and builds hash section links.
- `app/api/products/route.ts` parses a web-standard `Request` through `safeParseRequest`.

> Local development note: shared contracts import the repository source through `../shared/urlkit.ts`. `next.config.ts` adds a webpack extension alias so the source package's ESM `.js` specifiers resolve to local `.ts` files before the package is built.

## Run

```sh
npm install
npm run dev
```

Then open:

```txt
/products?tags=sale&tags=leather&page=1
/products/red-wing-iron-ranger#reviews
/api/products?sort=price-desc&inStock=true
```
