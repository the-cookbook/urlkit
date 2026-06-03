import type { BuildSearchOptions } from '../contracts.js';
import type { InferRuntimeSearch, RuntimeSearchSchema, SearchBuildOptions } from './contracts.js';
import { buildRawSearch } from './build-raw-search.js';
import { buildSchemaSearch } from './build-schema-search.js';

export function buildSearch<const Schema extends RuntimeSearchSchema>(
  input: Partial<InferRuntimeSearch<Schema>> | undefined,
  options: SearchBuildOptions<Schema> & { readonly schema: Schema },
): string;
export function buildSearch(input?: Record<string, unknown>, options?: BuildSearchOptions): string;
export function buildSearch(
  input: Record<string, unknown> | undefined = {},
  options: SearchBuildOptions<RuntimeSearchSchema> = {},
): string {
  if (options.schema) {
    return buildSchemaSearch(input, options.schema, options);
  }

  return buildRawSearch(input, options);
}
