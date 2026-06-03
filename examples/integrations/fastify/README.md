# Fastify URLKit integration

This example uses Fastify with URLKit through a small local pre-handler factory. The middleware receives a URLKit contract first and parse options second, validates the incoming request URL, and stores the typed URL state on `request.urlKit`.

```ts
fastify.get(
  '/products',
  {
    preHandler: createUrlKitMiddleware(ProductFiltersUrl, { unknownSearch: 'preserve' }),
  },
  async (request, reply) => {
    const state = request.urlKit as ProductFiltersState;

    return reply
      .type('text/html')
      .send(renderProductList({ filters: state.search, result: listProducts(state.search) }));
  },
);
```

The example keeps Fastify route syntax and URLKit path patterns separate:

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
http://localhost:3000/products?filter.price.min=100&sort=price-desc
http://localhost:3000/products/red-wing-iron-ranger
http://localhost:3000/api/products?unknown=true
```
