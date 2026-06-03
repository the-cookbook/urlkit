# Express URLKit integration

This example shows a traditional Express server using URLKit through a small local middleware factory. The middleware receives a URLKit contract first and parse options second, validates the incoming request URL, and stores the typed URL state on `request.urlKit`.

```ts
productsRouter.get(
  '/products',
  createUrlKitMiddleware(ProductFiltersUrl, { unknownSearch: 'preserve' }),
  (request, response) => {
    const state = request.urlKit as ProductFiltersState;

    response
      .type('html')
      .send(renderProductList({ filters: state.search, result: listProducts(state.search) }));
  },
);
```

The example keeps Express route syntax and URLKit path patterns separate:

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
http://localhost:3000/products?tags=sale&tags=leather
http://localhost:3000/products/red-wing-iron-ranger#reviews
http://localhost:3000/api/products?filter.brand=Nike
```
