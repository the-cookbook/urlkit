import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  redirect,
  RouterProvider,
} from '@tanstack/react-router';
import { ProductDetailsUrl, ProductFiltersUrl } from '@shared/url-contracts';
import { findProduct, listProducts } from '@shared/product-data';
import { buildProductPagination, hasPagination } from '@shared/pagination';
import type { ProductPagination } from '@shared/pagination';
import './styles.css';

const rootRoute = createRootRoute({
  component: AppLayout,
  beforeLoad: ({ location }) => {
    if (location.pathname !== '/') {
      return;
    }

    throw redirect({
      to: '/products',
    });
  },
});

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  loader: ({ location }) => {
    const parsed = ProductFiltersUrl.safeParse(`/products${location.searchStr}`, {
      unknownSearch: 'preserve',
    });

    if (!parsed.success) {
      throw new Error(parsed.error.message);
    }

    const result = listProducts(parsed.data.search);

    return {
      state: parsed.data,
      result,
      pagination: buildProductPagination(parsed.data.search, result),
    };
  },
  component: ProductsPage,
});

const productDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products/$slug',
  loader: ({ params }) => {
    const normalized = ProductDetailsUrl.safeNormalize({ params });

    if (!normalized.success) {
      throw new Error(normalized.error.message);
    }

    const product = findProduct(normalized.data.params.slug);

    if (!product) {
      throw new Error('Product not found.');
    }

    return { product };
  },
  component: ProductPage,
});

const routeTree = rootRoute.addChildren([productsRoute, productDetailRoute]);
const router = createRouter({ routeTree });

function AppLayout() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="/products">
          Cookbook Commerce
        </a>
        <nav aria-label="Primary navigation">
          <a href="/products">Products</a>
        </nav>
      </header>
      <Outlet />
      <footer className="site-footer">Built with shared URLKit contracts.</footer>
    </div>
  );
}

function ProductsPage() {
  const { result, pagination } = productsRoute.useLoaderData();

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">TanStack Router loader</p>
        <h1>Product catalog</h1>
        <p>URLKit owns URL validation while TanStack Router owns route matching and rendering.</p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Filters</h2>
            <p>{result.totalItems} products found.</p>
          </div>
          <a
            className="button button-secondary"
            href={ProductFiltersUrl.build({ search: {} }, { defaults: 'omit' })}
          >
            Reset
          </a>
        </div>
        <nav className="quick-links" aria-label="Example filters">
          <a
            href={ProductFiltersUrl.build(
              { search: { tags: ['sale'], page: 1 } },
              { defaults: 'omit' },
            )}
          >
            Sale products
          </a>
          <a
            href={ProductFiltersUrl.build(
              { search: { tags: ['leather'], page: 1 } },
              { defaults: 'omit' },
            )}
          >
            Leather
          </a>
        </nav>
      </section>

      <section className="product-grid" aria-label="Products">
        {result.items.map((product) => (
          <article className="product-card" key={product.id}>
            <div>
              <p className="eyebrow">
                {product.brand} · {product.category}
              </p>
              <h2>
                <a href={ProductDetailsUrl.build({ params: { slug: product.slug } })}>
                  {product.name}
                </a>
              </h2>
              <p>{product.description}</p>
            </div>
            <div className="product-card-footer">
              <span>${product.price}</span>
              <span>{product.inStock ? 'In stock' : 'Out of stock'}</span>
            </div>
          </article>
        ))}
      </section>

      <Pagination pagination={pagination} />
    </main>
  );
}

function Pagination({ pagination }: { readonly pagination: ProductPagination }) {
  if (!hasPagination(pagination)) {
    return null;
  }

  return (
    <nav className="pagination" aria-label="Pagination">
      {pagination.previousHref ? (
        <a className="button button-secondary" href={pagination.previousHref}>
          Previous
        </a>
      ) : (
        <span />
      )}
      <span>
        Page {pagination.page} of {pagination.totalPages}
      </span>
      {pagination.nextHref ? (
        <a className="button" href={pagination.nextHref}>
          Next
        </a>
      ) : (
        <span />
      )}
    </nav>
  );
}

function ProductPage() {
  const { product } = productDetailRoute.useLoaderData();

  return (
    <main>
      <a className="back-link" href={ProductFiltersUrl.build({ search: {} }, { defaults: 'omit' })}>
        Back to products
      </a>
      <section className="hero product-hero">
        <p className="eyebrow">
          {product.brand} · {product.category}
        </p>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
        <p className="product-meta">
          ${product.price} · Rating {product.rating} ·{' '}
          {product.inStock ? 'In stock' : 'Out of stock'}
        </p>
      </section>
      <nav className="tabs" aria-label="Product sections">
        <a href={ProductDetailsUrl.build({ params: { slug: product.slug }, hash: 'overview' })}>
          Overview
        </a>
        <a href={ProductDetailsUrl.build({ params: { slug: product.slug }, hash: 'reviews' })}>
          Reviews
        </a>
        <a href={ProductDetailsUrl.build({ params: { slug: product.slug }, hash: 'shipping' })}>
          Shipping
        </a>
      </nav>
      <section className="panel" id="overview">
        <h2>Overview</h2>
        <p>{product.description}</p>
      </section>
      <section className="panel" id="reviews">
        <h2>Reviews</h2>
        <p>Average rating: {product.rating}</p>
      </section>
      <section className="panel" id="shipping">
        <h2>Shipping</h2>
        <p>Ships in 2-4 business days.</p>
      </section>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
