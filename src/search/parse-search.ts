import type {
  InferRuntimeSearch,
  ParseSearchOptions,
  RawSearchParams,
  RuntimeSearchSchema,
  SearchParseResult,
} from './contracts.js';
import { compileSearchSchema } from './compile-search-schema.js';
import { parseRawSearch } from './parse-raw-search.js';
import { parseCompiledSearch } from './parse-compiled-search.js';

export function parseSearch(input: string | URLSearchParams): RawSearchParams;
export function parseSearch<const Schema extends RuntimeSearchSchema>(
  input: string | URLSearchParams,
  options: ParseSearchOptions<Schema> & {
    readonly schema: Schema;
    readonly invalidSearch: 'omit';
  },
): SearchParseResult<Partial<InferRuntimeSearch<Schema>>>;
export function parseSearch<const Schema extends RuntimeSearchSchema>(
  input: string | URLSearchParams,
  options: ParseSearchOptions<Schema> & { readonly schema: Schema },
): SearchParseResult<InferRuntimeSearch<Schema>>;
export function parseSearch(
  input: string | URLSearchParams,
  options?: ParseSearchOptions<RuntimeSearchSchema>,
): RawSearchParams | SearchParseResult<Record<string, unknown>> {
  const rawSearch = parseRawSearch(input);

  if (!options?.schema) {
    return rawSearch;
  }

  return parseSchemaSearch(rawSearch, options.schema, options);
}

function parseSchemaSearch(
  rawSearch: RawSearchParams,
  schema: RuntimeSearchSchema,
  options: ParseSearchOptions,
): SearchParseResult<Record<string, unknown>> {
  return parseCompiledSearch(
    rawSearch,
    compileSearchSchema(schema),
    options.unknownSearch ?? 'strip',
    {
      ...(options.arrayFormat ? { arrayFormat: options.arrayFormat } : {}),
      ...(options.invalidSearch ? { invalidSearch: options.invalidSearch } : {}),
    },
  );
}
