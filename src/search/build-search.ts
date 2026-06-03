import type { BuildSearchOptions, SearchInputArgument } from '../contracts.js';
import type {
  InferRuntimeSearchBuildInput,
  RuntimeSearchSchema,
  SearchBuildOptions,
} from './contracts.js';
import { buildRawSearch } from './build-raw-search.js';
import { buildSchemaSearch } from './build-schema-search.js';

export function buildSearch<const Schema extends RuntimeSearchSchema>(
  input: SearchInputArgument<InferRuntimeSearchBuildInput<Schema>>,
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
