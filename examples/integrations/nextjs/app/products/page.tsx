import Link from 'next/link';
import { ProductDetailsUrl, ProductFiltersUrl } from '@shared/url-contracts';
import { listProducts } from '@shared/product-data';
import { buildProductPagination, hasPagination } from '@shared/pagination';
import type { ProductPagination } from '@shared/pagination';

interface ProductsPageProps {
  readonly searchParams: Promise<Record<string, string | readonly string[] | undefined>>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const parsed = ProductFiltersUrl.safeParse(toUrl('/products', await searchParams), {
    unknownSearch: 'preserve',
  });

  if (!parsed.success) {
    return <InvalidProductUrl code={parsed.error.code} message={parsed.error.message} />;
  }

  const result = listProducts(parsed.data.search);
  const pagination = buildProductPagination(parsed.data.search, result);
  const saleHref = ProductFiltersUrl.build(
    {
      search: {
        ...parsed.data.search,
        tags: ['sale'],
        page: 1,
      },
    },
    { defaults: 'omit' },
  );

  return (
    <main>
      <section className="hero">
        <p className="eyebrow">Next.js App Router</p>
        <h1>Product catalog</h1>
        <p>
          Server-rendered product filters backed by one shared URLKit contract for parsing,
          defaults, and canonical links.
        </p>
      </section>

      <section className="panel">
        <div className="section-heading">
          <div>
            <h2>Filters</h2>
            <p>{result.totalItems} products found.</p>
          </div>
          <Link
            className="button button-secondary"
            href={ProductFiltersUrl.build({ search: {} }, { defaults: 'omit' })}
          >
            Reset
          </Link>
        </div>
        {parsed.data.unknownSearch ? <p>Ignored unknown search params.</p> : null}
        <nav className="quick-links" aria-label="Example filters">
          <Link href={saleHref}>Sale products</Link>
          <Link
            href={ProductFiltersUrl.build(
              { search: { tags: ['leather'], page: 1 } },
              { defaults: 'omit' },
            )}
          >
            Leather
          </Link>
          <Link
            href={ProductFiltersUrl.build(
              { search: { filter: { brand: ['Nike'] }, page: 1 } },
              { defaults: 'omit' },
            )}
          >
            Nike
          </Link>
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
                <Link href={ProductDetailsUrl.build({ params: { slug: product.slug } })}>
                  {product.name}
                </Link>
              </h2>
              <p>{product.description}</p>
            </div>
            <div className="product-card-footer">
              <span>${product.price}</span>
              <span>{product.inStock ? 'In stock' : 'Out of stock'}</span>
            </div>
            <p className="tags">
              {product.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </p>
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
        <Link className="button button-secondary" href={pagination.previousHref}>
          Previous
        </Link>
      ) : (
        <span />
      )}
      <span>
        Page {pagination.page} of {pagination.totalPages}
      </span>
      {pagination.nextHref ? (
        <Link className="button" href={pagination.nextHref}>
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

function InvalidProductUrl({ code, message }: { readonly code: string; readonly message: string }) {
  return (
    <main>
      <section className="panel error-card">
        <p className="eyebrow">Invalid product URL</p>
        <h1>{code}</h1>
        <p>{message}</p>
      </section>
    </main>
  );
}

function toUrl(
  pathname: string,
  searchParams: Record<string, string | readonly string[] | undefined>,
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
      continue;
    }

    if (value) {
      params.set(key, value);
    }
  }

  const search = params.toString();
  return search ? `${pathname}?${search}` : pathname;
}
