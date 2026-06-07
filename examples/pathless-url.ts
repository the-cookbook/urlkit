import { string, url, enumOf, array } from '@cookbook/urlkit';

const ProductFilters = url({
  search: {
    categories: array(string()).optional(),
    sortBy: enumOf(['recommendation', 'desc', 'asc', 'priceDesc', 'priceAsc']).optional(),
  },
});

const parsedFilters = ProductFilters.parse('/products/42?categories=gadgets&sortBy=priceAsc');

// parsedFilters.pathname === '/users/42'
// parsedFilters.params === {}
// parsedFilters.search.categories === ['gadgets']
// parsedFilters.search.sortBy === 'priceAsc'
// parsedFilters.hash = undefined

const filtersHref = ProductFilters.build({
  search: { categories: ['books'], sortBy: 'recommendation' },
});

// filtersHref === '?categories=books&sortBy=recommendation'

const filtersParses = ProductFilters.parse('/products?categories=electronics');
const filtersDoesNotParse = ProductFilters.parse('/products?tab=settings');

// filtersMatches === true
// filtersDoesNotMatch === false

export { ProductFilters, parsedFilters, filtersHref, filtersParses, filtersDoesNotParse };
