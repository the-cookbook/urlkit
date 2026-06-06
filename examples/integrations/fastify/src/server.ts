import Fastify from 'fastify';
import { ProductDetailsUrl, ProductFiltersUrl } from '../../shared/url-contracts.js';
import type { ProductDetailsState, ProductFiltersState } from '../../shared/url-contracts.js';
import { findProduct, listProducts } from '../../shared/product-data.js';
import { renderProductDetails, renderProductList } from '../../shared/render-products.js';
import { createUrlKitMiddleware } from './urlkit-middleware.js';

const fastify = Fastify({ logger: true });

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

fastify.get(
  '/products/:slug',
  {
    preHandler: createUrlKitMiddleware(ProductDetailsUrl, { statusCode: 404 }),
  },
  async (request, reply) => {
    const state = request.urlKit as ProductDetailsState;
    const product = findProduct(state.params.slug);

    if (!product) {
      return reply.status(404).send({ message: 'Product not found.' });
    }

    return reply.type('text/html').send(renderProductDetails(product));
  },
);

fastify.get(
  '/api/products',
  {
    preHandler: createUrlKitMiddleware(ProductFiltersUrl, {
      unknownSearch: 'error',
      getUrl: (request) => request.url.replace(/^\/api\/products/, '/products'),
    }),
  },
  async (request) => {
    const state = request.urlKit as ProductFiltersState;

    return { state, result: listProducts(state.search) };
  },
);

await fastify.listen({ port: 3000 });
