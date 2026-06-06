import { compileStaticSearch, compileStaticUrl } from '@cookbook/urlkit/static';

const productSearchDescriptor = {
  page: { type: 'int', default: 1 },
  sort: {
    type: 'enum',
    values: ['newest', 'popular'],
    default: 'newest',
  },
  tag: { type: 'string', many: true, optional: true },
} as const;

const compiledSearch = compileStaticSearch(productSearchDescriptor);

const productUrlDescriptor = {
  path: '/products/{id:int}',
  search: productSearchDescriptor,
  hash: {
    type: 'enum',
    values: ['details', 'reviews'],
    optional: true,
  },
} as const;

const compiledUrl = compileStaticUrl(productUrlDescriptor);

// Static descriptors are plain data and remain analyzable by router tooling.
// Use runtime builders in URLKit runtime contracts, not inside static route descriptors.

// Invalid inside static router descriptors:
// const invalidStaticDescriptor = {
//   search: {
//     page: int().default(1),
//   },
// };

export { compiledSearch, compiledUrl, productSearchDescriptor, productUrlDescriptor };
