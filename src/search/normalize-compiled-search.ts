import { UrlKitError } from '../errors/url-kit-error.js';
import type { UnknownSearchBehavior, UnknownSearchParams } from '../contracts.js';
import type { CompiledSearchSchema, SearchParseResult } from './contracts.js';
import { copyUnknownStructuredSearch } from './copy-unknown-structured-search.js';
import { normalizeSearchBuildValue } from './normalize-search-build-value.js';

export function normalizeCompiledSearch(
  input: unknown,
  compiled: CompiledSearchSchema | undefined,
  unknownSearch: UnknownSearchBehavior = 'strip',
): SearchParseResult<Record<string, unknown>> {
  if (input === undefined || input === null) {
    return normalizeCompiledSearchObject({}, compiled, unknownSearch);
  }

  if (!isRecord(input)) {
    throw new UrlKitError('invalid-search', 'Search must be an object.', { path: ['search'] });
  }

  return normalizeCompiledSearchObject(input, compiled, unknownSearch);
}

function normalizeCompiledSearchObject(
  input: Readonly<Record<string, unknown>>,
  compiled: CompiledSearchSchema | undefined,
  unknownSearch: UnknownSearchBehavior,
): SearchParseResult<Record<string, unknown>> {
  const search: Record<string, unknown> = {};
  const knownKeys = compiled?.keys ?? emptyKeys;

  for (const field of compiled?.fields ?? []) {
    const value = normalizeSearchBuildValue(field, input[field.key]);

    if (value !== undefined) {
      search[field.key] = value;
    }
  }

  const unknownValues = collectUnknownValues(input, knownKeys);
  const unknown = resolveUnknownSearch(unknownValues, unknownSearch);

  return Object.freeze({
    search: Object.freeze(search),
    ...(unknown ? { unknownSearch: unknown } : {}),
  });
}

const emptyKeys = Object.freeze(new Set<string>());

function collectUnknownValues(
  input: Readonly<Record<string, unknown>>,
  knownKeys: ReadonlySet<string>,
): Readonly<Record<string, unknown>> {
  const unknown: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(input)) {
    if (!knownKeys.has(key)) {
      unknown[key] = value;
    }
  }

  return unknown;
}

function resolveUnknownSearch(
  unknown: Readonly<Record<string, unknown>>,
  behavior: UnknownSearchBehavior,
): UnknownSearchParams | undefined {
  const keys = Object.keys(unknown);

  if (!keys.length || behavior === 'strip') {
    return undefined;
  }

  if (behavior === 'error') {
    throw new UrlKitError('invalid-search', 'Unknown search parameter is not allowed.', {
      path: [keys[0]!],
    });
  }

  return copyUnknownStructuredSearch(unknown);
}

function isRecord(input: unknown): input is Readonly<Record<string, unknown>> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
