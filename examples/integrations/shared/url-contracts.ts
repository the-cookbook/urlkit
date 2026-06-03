import {
  array,
  boolean,
  createConstraint,
  enumOf,
  int,
  object,
  registerPathConstraint,
  string,
  url,
} from './urlkit.js';

export const slugConstraint = createConstraint({
  parse(paramName, value) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(value))) {
      throw new Error(`Path parameter "${paramName}" must be a lowercase slug.`);
    }
  },
  verify(paramName, params) {
    if (params.trim()) {
      throw new Error(
        `Constraint "productslug" declared for "${paramName}" does not accept arguments.`,
      );
    }
  },
  toRegExp() {
    return '[a-z0-9]+(?:-[a-z0-9]+)*';
  },
});

registerPathConstraint('productslug', slugConstraint);

export const ApiProductFiltersUrl = url({
  path: '/api/products',
  search: {
    q: string().optional(),
    page: int().default(1),
    sort: enumOf(['newest', 'popular', 'price-asc', 'price-desc']).default('popular'),
    tags: array(string()).default([]),
    inStock: boolean().default(false),
    filter: object({
      brand: array(string()).default([]),
      price: object({
        min: int().optional(),
        max: int().optional(),
      }).optional(),
    }).optional(),
  },
});

export const ProductFiltersUrl = url({
  path: '/products',
  search: {
    q: string().optional(),
    page: int().default(1),
    sort: enumOf(['newest', 'popular', 'price-asc', 'price-desc']).default('popular'),
    tags: array(string()).default([]),
    inStock: boolean().default(false),
    filter: object({
      brand: array(string()).default([]),
      price: object({
        min: int().optional(),
        max: int().optional(),
      }).optional(),
    }).optional(),
  },
});

export const CommaProductFiltersUrl = url(
  {
    path: '/products',
    search: {
      q: string().optional(),
      page: int().default(1),
      sort: enumOf(['newest', 'popular', 'price-asc', 'price-desc']).default('popular'),
      tags: array(string()).default([]),
      inStock: boolean().default(false),
    },
  },
  { arrayFormat: 'comma' },
);

export const ProductDetailsUrl = url({
  path: '/products/{slug:productslug}',
  hash: enumOf(['overview', 'reviews', 'shipping']).optional(),
});

export interface ProductFiltersSearch {
  readonly q?: string;
  readonly page: number;
  readonly sort: 'newest' | 'popular' | 'price-asc' | 'price-desc';
  readonly tags: readonly string[];
  readonly inStock: boolean;
  readonly filter?: {
    readonly brand: readonly string[];
    readonly price?: {
      readonly min?: number;
      readonly max?: number;
    };
  };
}

export type ProductFiltersState = ReturnType<typeof ProductFiltersUrl.parse>;

export type ProductDetailsState = ReturnType<typeof ProductDetailsUrl.parse>;
