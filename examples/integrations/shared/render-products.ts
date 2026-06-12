import { buildProductPagination, hasPagination } from './pagination.js';
import { ProductDetailsUrl, ProductFiltersUrl } from './url-contracts.js';
import type { Product, ProductListResult } from './product-data.js';
import type { ProductFiltersSearch } from './url-contracts.js';

export interface ProductPageViewModel {
  readonly filters: ProductFiltersSearch;
  readonly result: ProductListResult;
}

export function buildFilterHref(search: Partial<ProductFiltersSearch>): string {
  return ProductFiltersUrl.build({ search }, { defaults: 'omit' });
}

export function buildProductHref(slug: string): string {
  return ProductDetailsUrl.build({ params: { slug } });
}

export function buildProductSectionHref(
  slug: string,
  section: 'overview' | 'reviews' | 'shipping',
): string {
  return ProductDetailsUrl.build({ params: { slug }, hash: section });
}

export function renderProductList({ filters, result }: ProductPageViewModel): string {
  const cards = result.items.map(renderProductCard).join('\n');
  const pagination = buildProductPagination(filters, result);

  return renderLayout({
    title: 'Product catalog',
    activePath: '/products',
    content: `<section class="hero">
        <p class="eyebrow">URLKit integration example</p>
        <h1>Product catalog</h1>
        <p>Filter, sort, paginate, and build canonical product URLs from one shared URLKit contract.</p>
      </section>
      <section class="panel">
        <div class="section-heading">
          <div>
            <h2>Filters</h2>
            <p>${result.totalItems} products found.</p>
          </div>
          <a class="button button-secondary" href="${ProductFiltersUrl.build({ search: {} }, { defaults: 'omit' })}">Reset</a>
        </div>
        <form class="filter-grid" action="/products" method="get">
          <label>
            Search
            <input name="q" value="${escapeHtml(filters.q ?? '')}" placeholder="boots, bags, headphones" />
          </label>
          <label>
            Sort
            <select name="sort">
              ${renderSortOption(filters.sort, 'popular')}
              ${renderSortOption(filters.sort, 'newest')}
              ${renderSortOption(filters.sort, 'price-asc')}
              ${renderSortOption(filters.sort, 'price-desc')}
            </select>
          </label>
          <label class="checkbox-label">
            <input type="checkbox" name="inStock" value="true" ${filters.inStock ? 'checked' : ''} />
            In stock only
          </label>
          <button class="button" type="submit">Apply filters</button>
        </form>
        <nav class="quick-links" aria-label="Example filters">
          <a href="${buildFilterHref({ ...filters, tags: ['leather'], page: 1 })}">Leather</a>
          <a href="${buildFilterHref({ ...filters, tags: ['sale'], page: 1 })}">Sale</a>
          <a href="${buildFilterHref({ ...filters, filter: { brand: ['Nike'] }, page: 1 })}">Nike</a>
        </nav>
      </section>
      <section class="product-grid" aria-label="Products">${cards}</section>
      ${renderPagination(pagination)}`,
  });
}

export function renderProductDetails(product: Product): string {
  return renderLayout({
    title: product.name,
    activePath: '/products',
    content: `<a class="back-link" href="${ProductFiltersUrl.build({ search: {} }, { defaults: 'omit' })}">Back to products</a>
      <section class="hero product-hero">
        <p class="eyebrow">${escapeHtml(product.brand)} · ${escapeHtml(product.category)}</p>
        <h1>${escapeHtml(product.name)}</h1>
        <p>${escapeHtml(product.description)}</p>
        <p class="product-meta">$${product.price} · Rating ${product.rating} · ${product.inStock ? 'In stock' : 'Out of stock'}</p>
      </section>
      <nav class="tabs" aria-label="Product sections">
        <a href="${buildProductSectionHref(product.slug, 'overview')}">Overview</a>
        <a href="${buildProductSectionHref(product.slug, 'reviews')}">Reviews</a>
        <a href="${buildProductSectionHref(product.slug, 'shipping')}">Shipping</a>
      </nav>
      <section class="panel" id="overview"><h2>Overview</h2><p>${escapeHtml(product.description)}</p></section>
      <section class="panel" id="reviews"><h2>Reviews</h2><p>Average rating: ${product.rating}</p></section>
      <section class="panel" id="shipping"><h2>Shipping</h2><p>Ships in 2-4 business days.</p></section>`,
  });
}

function renderLayout(input: {
  readonly title: string;
  readonly activePath: string;
  readonly content: string;
}): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(input.title)}</title>
    <style>${siteCss}</style>
  </head>
  <body>
    <div class="site-shell">
      <header class="site-header">
        <a class="brand" href="/products">Cookbook Commerce</a>
        <nav aria-label="Primary navigation">
          <a ${input.activePath === '/products' ? 'aria-current="page"' : ''} href="/products">Products</a>
          <a href="/api/products">API</a>
        </nav>
      </header>
      <main>${input.content}</main>
      <footer class="site-footer">Built with shared URLKit contracts.</footer>
    </div>
  </body>
</html>`;
}

function renderProductCard(product: Product): string {
  return `<article class="product-card">
    <div>
      <p class="eyebrow">${escapeHtml(product.brand)} · ${escapeHtml(product.category)}</p>
      <h2><a href="${buildProductHref(product.slug)}">${escapeHtml(product.name)}</a></h2>
      <p>${escapeHtml(product.description)}</p>
    </div>
    <div class="product-card-footer">
      <span>$${product.price}</span>
      <span>${product.inStock ? 'In stock' : 'Out of stock'}</span>
    </div>
    <p class="tags">${product.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join('')}</p>
  </article>`;
}

function renderPagination(pagination: ReturnType<typeof buildProductPagination>): string {
  if (!hasPagination(pagination)) {
    return '';
  }

  return `<nav class="pagination" aria-label="Pagination">
    ${pagination.previousHref ? `<a class="button button-secondary" href="${pagination.previousHref}">Previous</a>` : '<span></span>'}
    <span>Page ${pagination.page} of ${pagination.totalPages}</span>
    ${pagination.nextHref ? `<a class="button" href="${pagination.nextHref}">Next</a>` : '<span></span>'}
  </nav>`;
}

function renderSortOption(
  current: ProductFiltersSearch['sort'],
  value: ProductFiltersSearch['sort'],
): string {
  return `<option value="${value}" ${current === value ? 'selected' : ''}>${value}</option>`;
}

function escapeHtml(input: string): string {
  return input
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

const siteCss = `
  :root {
    color-scheme: light;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background: #f6f3ee;
    color: #211f1c;
  }

  * { box-sizing: border-box; }
  body { margin: 0; background: #f6f3ee; }
  a { color: inherit; }

  .site-shell {
    width: min(1120px, calc(100% - 32px));
    margin: 0 auto;
    padding: 24px 0 48px;
  }

  .site-header, .site-footer, .panel, .product-card, .hero {
    border: 1px solid #dfd5c7;
    background: #fffaf2;
    border-radius: 24px;
  }

  .site-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 24px;
    padding: 16px 20px;
    margin-bottom: 24px;
  }

  .brand { font-weight: 800; text-decoration: none; }
  .site-header nav, .quick-links, .tabs { display: flex; flex-wrap: wrap; gap: 12px; }
  .site-header nav a, .quick-links a, .tabs a, .back-link { color: #654321; font-weight: 700; }
  main { display: grid; gap: 20px; }

  .hero { padding: 40px; background: linear-gradient(135deg, #fffaf2, #ede3d2); }
  .hero h1 { margin: 0 0 12px; font-size: clamp(2.2rem, 5vw, 4.5rem); line-height: .95; }
  .hero p { max-width: 720px; font-size: 1.08rem; }
  .eyebrow { margin: 0 0 8px; color: #80613c; font-size: .78rem; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }

  .panel { padding: 24px; }
  .section-heading { display: flex; justify-content: space-between; align-items: start; gap: 16px; margin-bottom: 20px; }
  .section-heading h2 { margin: 0 0 4px; }
  .section-heading p { margin: 0; color: #6f665b; }

  .filter-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; align-items: end; }
  label { display: grid; gap: 6px; font-weight: 700; }
  .checkbox-label { display: flex; align-items: center; gap: 8px; padding-bottom: 12px; }
  .checkbox-label input { width: auto; }
  input, select { width: 100%; border: 1px solid #cbbca8; border-radius: 12px; padding: 10px 12px; font: inherit; background: white; }
  .quick-links { margin-top: 18px; }

  .button { border: 0; border-radius: 999px; background: #211f1c; color: white; padding: 10px 16px; font: inherit; font-weight: 800; text-decoration: none; text-align: center; cursor: pointer; }
  .button-secondary { background: #eadfcc; color: #211f1c; }

  .product-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
  .product-card { display: grid; gap: 20px; padding: 24px; min-height: 260px; }
  .product-card h2 { margin: 0 0 10px; font-size: 1.4rem; }
  .product-card p { margin: 0; color: #5d554c; }
  .product-card-footer { display: flex; justify-content: space-between; gap: 12px; font-weight: 800; }
  .tags { display: flex; flex-wrap: wrap; gap: 8px; }
  .tags span { border-radius: 999px; background: #eee4d4; padding: 5px 9px; font-size: .85rem; }

  .pagination { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 16px; }
  .pagination .button:last-child { justify-self: end; }
  .product-meta { font-weight: 800; }
  .site-footer { margin-top: 24px; padding: 16px 20px; color: #6f665b; }

  @media (max-width: 760px) {
    .site-header, .section-heading { align-items: stretch; flex-direction: column; }
    .filter-grid, .product-grid { grid-template-columns: 1fr; }
    .hero { padding: 28px; }
  }
`;
