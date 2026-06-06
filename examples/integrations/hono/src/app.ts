import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { ProductDetailsUrl, ProductFiltersUrl } from '../../shared/url-contracts.js';
import type { ProductDetailsState, ProductFiltersState } from '../../shared/url-contracts.js';
import { findProduct, listProducts } from '../../shared/product-data.js';
import { renderProductDetails, renderProductList } from '../../shared/render-products.js';
import { createUrlKitMiddleware } from './urlkit-middleware.js';
import type { UrlKitHonoVariables } from './urlkit-middleware.js';

const app = new Hono<{ Variables: UrlKitHonoVariables }>();

app.get('/', (context) => {
  return context.redirect('/products');
});

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

app.get(
  '/products/:slug',
  createUrlKitMiddleware(ProductDetailsUrl, { statusCode: 404 }),
  (context) => {
    const state = context.get('urlKit') as ProductDetailsState;
    const product = findProduct(state.params.slug);

    if (!product) {
      return context.json({ message: 'Product not found.' }, 404);
    }

    return context.html(renderProductDetails(product));
  },
);

app.get(
  '/api/products',
  createUrlKitMiddleware(ProductFiltersUrl, {
    unknownSearch: 'error',
    getUrl: (context) => {
      const url = new URL(context.req.raw.url);
      url.pathname = '/products';

      return url.toString();
    },
  }),
  (context) => {
    const state = context.get('urlKit') as ProductFiltersState;

    return context.json({ state, result: listProducts(state.search) });
  },
);

serve({ fetch: app.fetch, port: 3000 });

console.log('Hono URLKit example: http://localhost:3000/products');
