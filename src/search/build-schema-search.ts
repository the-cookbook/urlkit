import type { BuildSearchOptions } from '../contracts.js';
import { compileSearchSchema } from './compile-search-schema.js';
import type { RuntimeSearchSchema } from './contracts.js';
import { buildCompiledSearch } from './build-compiled-search.js';

export function buildSchemaSearch(
  input: Record<string, unknown> = {},
  schema: RuntimeSearchSchema,
  options: BuildSearchOptions = {},
): string {
  return buildCompiledSearch(input, compileSearchSchema(schema), options);
}
