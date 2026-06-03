import type { ProductListResult } from './product-data.js';
import type { ProductFiltersSearch } from './url-contracts.js';
import { ProductFiltersUrl } from './url-contracts.js';

export interface ProductPagination {
  readonly page: number;
  readonly totalPages: number;
  readonly previousHref?: string;
  readonly nextHref?: string;
}

export function buildProductPagination(
  filters: ProductFiltersSearch,
  result: ProductListResult,
): ProductPagination {
  const previousHref =
    result.page > 1
      ? ProductFiltersUrl.build(
          { search: { ...filters, page: result.page - 1 } },
          { defaults: 'omit' },
        )
      : undefined;
  const nextHref =
    result.page < result.totalPages
      ? ProductFiltersUrl.build(
          { search: { ...filters, page: result.page + 1 } },
          { defaults: 'omit' },
        )
      : undefined;

  return {
    page: result.page,
    totalPages: result.totalPages,
    ...(previousHref ? { previousHref } : {}),
    ...(nextHref ? { nextHref } : {}),
  };
}

export function hasPagination(pagination: ProductPagination): boolean {
  return Boolean(pagination.previousHref || pagination.nextHref);
}
