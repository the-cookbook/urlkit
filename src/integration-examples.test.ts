import { describe, expect, it } from 'vitest';
import { listProducts } from '../examples/integrations/shared/product-data.js';
import {
  CommaProductFiltersUrl,
  ProductDetailsUrl,
  ProductFiltersUrl,
} from '../examples/integrations/shared/url-contracts.js';
import { buildProductSectionHref } from '../examples/integrations/shared/render-products.js';

describe('integration example shared contracts', () => {
  it('parses product filters and filters mock products', () => {
    const parsed = ProductFiltersUrl.parse(
      '/products?tags=sale&tags=leather&filter.brand=Red+Wing&inStock=true',
    );
    const result = listProducts(parsed.search);

    expect(parsed.search.tags).toEqual(['sale', 'leather']);
    expect(parsed.search.filter?.brand).toEqual(['Red Wing']);
    expect(result.items.map((product) => product.slug)).toEqual(['red-wing-iron-ranger']);
  });

  it('builds default repeated arrays and comma arrays with per-call override', () => {
    expect(
      ProductFiltersUrl.build(
        { search: { tags: ['sale', 'leather'], page: 1, sort: 'popular', inStock: false } },
        { defaults: 'omit' },
      ),
    ).toBe('/products?tags=sale&tags=leather');

    expect(
      CommaProductFiltersUrl.build(
        { search: { tags: ['sale', 'leather'], page: 1, sort: 'popular', inStock: false } },
        { defaults: 'omit' },
      ),
    ).toBe('/products?tags=sale%2Cleather');

    expect(
      CommaProductFiltersUrl.build(
        { search: { tags: ['sale', 'leather'], page: 1, sort: 'popular', inStock: false } },
        { arrayFormat: 'repeat', defaults: 'omit' },
      ),
    ).toBe('/products?tags=sale&tags=leather');
  });

  it('validates product detail slugs and builds section hashes', () => {
    expect(ProductDetailsUrl.parse('/products/red-wing-iron-ranger').params.slug).toBe(
      'red-wing-iron-ranger',
    );
    expect(ProductDetailsUrl.safeParse('/products/Red-Wing-Iron-Ranger').success).toBe(false);
    expect(buildProductSectionHref('red-wing-iron-ranger', 'reviews')).toBe(
      '/products/red-wing-iron-ranger#reviews',
    );
  });
});
