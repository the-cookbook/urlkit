import { Router } from 'express';
import { ProductDetailsUrl, ProductFiltersUrl } from '../../../shared/url-contracts.js';
import type { ProductDetailsState, ProductFiltersState } from '../../../shared/url-contracts.js';
import { findProduct, listProducts } from '../../../shared/product-data.js';
import { renderProductDetails, renderProductList } from '../../../shared/render-products.js';
import { createUrlKitMiddleware } from '../urlkit-middleware.js';

export const productsRouter = Router();

productsRouter.get('/', (_, response) => {
  response.redirect('/products');
});

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

productsRouter.get(
  '/products/:slug',
  createUrlKitMiddleware(ProductDetailsUrl, { statusCode: 404 }),
  (request, response) => {
    const state = request.urlKit as ProductDetailsState;
    const product = findProduct(state.params.slug);

    if (!product) {
      response.status(404).json({ message: 'Product not found.' });
      return;
    }

    response.type('html').send(renderProductDetails(product));
  },
);

productsRouter.get(
  '/api/products',
  createUrlKitMiddleware(ProductFiltersUrl, {
    unknownSearch: 'error',
    getUrl: (request) =>
      (request.originalUrl || request.url).replace(/^\/api\/products/, '/products'),
  }),
  (request, response) => {
    const state = request.urlKit as ProductFiltersState;

    response.json({ state, result: listProducts(state.search) });
  },
);
