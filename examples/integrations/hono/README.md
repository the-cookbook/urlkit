# Hono URLKit integration

This example uses Hono with URLKit through a small local middleware factory. The middleware receives a URLKit contract first and parse options second, validates `context.req.raw`, and stores the typed URL state with `context.set('urlKit', state)`.

```ts
app.get(
  '/products',
  createUrlKitMiddleware(ProductFiltersUrl, { unknownSearch: 'preserve' }),
  (context) => {
    const state = context.get('urlKit') as ProductFiltersState;

    return context.html(
      renderProductList({ filters: state.search, result: listProducts(state.search) }),
    );
  },
);
```

The example keeps Hono route syntax and URLKit path patterns separate:

- `/products` validates filters with `ProductFiltersUrl`.
- `/products/:slug` validates the full request URL with `ProductDetailsUrl`.
- `/api/products` uses `{ unknownSearch: 'error' }` to return typed URLKit errors for unsupported query params.

> Local development note: the example depends on `@cookbook/urlkit` through `file:../../..`, so build the root package first when running it from this repository.

## Run

```sh
npm install
npm run dev
```

Open:

```txt
http://localhost:3000/products?sort=price-asc&inStock=true
http://localhost:3000/products/red-wing-iron-ranger#reviews
http://localhost:3000/api/products?unknown=true
```
