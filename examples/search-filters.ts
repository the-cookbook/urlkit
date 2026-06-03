import { array, boolean, enumOf, int, search, string, url } from '@cookbook/urlkit';

const ProductFilters = url({
  search: {
    q: string().optional(),
    page: int().default(1),
    sort: enumOf(['newest', 'popular', 'price']).default('newest'),
    tags: array(string()).optional(),
    inStock: boolean().default(false),
  },
});

const state = ProductFilters.parse(
  '/products?q=shoes&page=2&sort=popular&tags=sale&tags=leather&inStock=true',
);

// state.pathname === '/products'
// state.search.tags === ['sale', 'leather']
// state.search.inStock === true

const suffix = ProductFilters.build({
  search: {
    page: 2,
    sort: 'popular',
    tags: ['sale', 'leather'],
    inStock: true,
  },
});

// suffix === '?page=2&sort=popular&tags=sale&tags=leather&inStock=true'

const fullPath = ProductFilters.build({
  pathname: '/products',
  search: {
    q: 'shoes',
    page: 2,
    sort: 'popular',
    tags: ['sale', 'leather'],
    inStock: true,
  },
});

// fullPath === '/products?q=shoes&page=2&sort=popular&tags=sale&tags=leather&inStock=true'

const compactDefaults = ProductFilters.build(
  {
    pathname: '/products',
    search: { page: 1, sort: 'newest', inStock: false },
  },
  { defaults: 'omit' },
);

// compactDefaults === '/products'

const normalized = ProductFilters.normalize({
  pathname: '/products',
  search: { sort: 'popular' },
});

// normalized.search.page === 1
// normalized.search.inStock === false

const preserved = ProductFilters.parse('/products?page=2&debug=true', {
  unknownSearch: 'preserve',
});

// preserved.search is strongly typed and does not include `debug`.
// preserved.unknownSearch === { debug: 'true' }

const rejectedUnknown = ProductFilters.safeParse('/products?page=2&debug=true', {
  unknownSearch: 'error',
});

// rejectedUnknown.success === false


const CommaProductFilters = url(
  {
    search: {
      tags: array(string()).optional(),
    },
  },
  { arrayFormat: 'comma' },
);

const commaParsed = CommaProductFilters.safeParse('/products?tags=sale%2Cleather');

// commaParsed.success === true
// commaParsed.data.search.tags === ['sale', 'leather']

const commaSuffix = CommaProductFilters.build({
  search: {
    tags: ['sale', 'leather'],
  },
});

// commaSuffix === '?tags=sale%2Cleather'

const repeatedSuffix = CommaProductFilters.build(
  {
    search: {
      tags: ['sale', 'leather'],
    },
  },
  { arrayFormat: 'repeat' },
);

// repeatedSuffix === '?tags=sale&tags=leather'

const FilterSearchOnly = search({
  page: int().default(1),
});

const searchOnlySuffix = FilterSearchOnly.build({ search: { page: 2 } });

// searchOnlySuffix === '?page=2'

export {
  FilterSearchOnly,
  CommaProductFilters,
  ProductFilters,
  commaParsed,
  commaSuffix,
  compactDefaults,
  fullPath,
  normalized,
  preserved,
  rejectedUnknown,
  repeatedSuffix,
  searchOnlySuffix,
  state,
  suffix,
};
