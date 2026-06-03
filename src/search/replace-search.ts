import type {
  InferRuntimeSearchBuildInput,
  RuntimeSearchSchema,
  SearchBuildOptions,
} from './contracts.js';
import { buildSearch } from './build-search.js';

export function replaceSearch<const Schema extends RuntimeSearchSchema>(
  current: string | URLSearchParams,
  next: InferRuntimeSearchBuildInput<Schema>,
  options: SearchBuildOptions<Schema> & { readonly schema: Schema },
): string;
export function replaceSearch(
  current: string | URLSearchParams,
  next: Record<string, unknown>,
  options?: SearchBuildOptions,
): string;
export function replaceSearch(
  _current: string | URLSearchParams,
  next: object,
  options: SearchBuildOptions = {},
): string {
  return buildSearch(next as Record<string, unknown>, options);
}
