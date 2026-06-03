import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { ProductDetailsUrl, ProductFiltersUrl } from '@shared/url-contracts';
import { listProducts } from '@shared/product-data';
import { buildProductPagination, hasPagination } from '@shared/pagination';
import type { ProductPagination } from '@shared/pagination';

export function loader({ request }: LoaderFunctionArgs) {
  const parsed = ProductFiltersUrl.safeParseRequest(request, { unknownSearch: 'preserve' });

  if (!parsed.success) {
    throw new Response(parsed.error.message, { status: 400 });
  }

  const result = listProducts(parsed.data.search);

  return json({
    filters: parsed.data.search,
    result,
    pagination: buildProductPagination(parsed.data.search, result),
  });
}

export default function ProductsRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Remix loader</p>
        <h1>Product catalog</h1>
        <p>Server-first URL parsing and canonical link building with the shared URLKit contract.</p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Filters</h2>
            <p>{data.result.totalItems} products found.</p>
          </div>
          <Link
            className="button button-secondary"
            to={ProductFiltersUrl.build({ search: {} }, { defaults: 'omit' })}
          >
            Reset
          </Link>
        </div>
        <nav className="quick-links" aria-label="Example filters">
          <Link
            to={ProductFiltersUrl.build(
              { search: { tags: ['sale'], page: 1 } },
              { defaults: 'omit' },
            )}
          >
            Sale products
          </Link>
          <Link
            to={ProductFiltersUrl.build(
              { search: { tags: ['leather'], page: 1 } },
              { defaults: 'omit' },
            )}
          >
            Leather
          </Link>
        </nav>
      </section>

      <section className="product-grid" aria-label="Products">
        {data.result.items.map((product) => (
          <article className="product-card" key={product.id}>
            <div>
              <p className="eyebrow">
                {product.brand} · {product.category}
              </p>
              <h2>
                <Link to={ProductDetailsUrl.build({ params: { slug: product.slug } })}>
                  {product.name}
                </Link>
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

      <Pagination pagination={data.pagination} />
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
        <Link className="button button-secondary" to={pagination.previousHref}>
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span>
        Page {pagination.page} of {pagination.totalPages}
      </span>
      {pagination.nextHref ? (
        <Link className="button" to={pagination.nextHref}>
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
