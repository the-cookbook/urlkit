# @cookbook/urlkit troubleshooting

## Defaults disappear when chained with `optional()` or `required()`

`default(value)` already means missing input can be accepted and normalized to the default value. It is the strongest presence rule.

Prefer the concise form:

```ts
const ProductFilters = url({
  search: {
    categories: array(string()).default(['electronics']),
    price: number().default(9.99),
    sortBy: enumOf(['recommendation', 'desc', 'asc', 'priceDesc', 'priceAsc']).optional(),
  },
});
```

These equivalent chains are also supported:

```ts
int().optional().default(1);
int().default(1).optional();
int().required().default(1);
int().default(1).required();
```

All defaulted variants apply the default during `parse()` and `normalize()`:

```ts
const parsed = ProductFilters.parse('/products/42');

parsed.search;
// { categories: ['electronics'], price: 9.99 }
```

`build()` includes missing defaulted search values by default and can omit values equal to defaults with `{ defaults: 'omit' }`:

```ts
ProductFilters.build({ search: { sortBy: 'recommendation' } });
// '?categories=electronics&price=9.99&sortBy=recommendation'

ProductFilters.build(
  {
    search: {
      categories: ['electronics'],
      price: 9.99,
      sortBy: 'recommendation',
    },
  },
  { defaults: 'omit' },
);
// '?sortBy=recommendation'
```

If defaults are not appearing, check that the field is actually defaulted. `optional()` alone produces `undefined` for missing input and is omitted from built search strings.
