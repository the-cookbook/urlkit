import type { BuildSearchOptions } from '../contracts.js';
import type { SearchEntry } from './search-entries.js';
import { appendSearchEntry } from './append-search-entry.js';
import { serializeSearchEntries } from './serialize-search-entries.js';

export function buildRawSearch(
  input: Record<string, unknown> = {},
  options: BuildSearchOptions = {},
): string {
  const entries: SearchEntry[] = [];

  for (const [key, value] of Object.entries(input)) {
    appendRawValue(entries, key, value, options);
  }

  return serializeSearchEntries(entries, options);
}

function appendRawValue(
  entries: Parameters<typeof appendSearchEntry>[0],
  key: string,
  value: unknown,
  options: BuildSearchOptions,
): void {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    appendSearchEntry(entries, key, value.filter(isPresent).map(String), options);
    return;
  }

  appendSearchEntry(entries, key, serializeRawScalar(value), options);
}

function isPresent(input: unknown): boolean {
  return input !== undefined && input !== null;
}

function serializeRawScalar(input: unknown): string {
  if (typeof input === 'string') {
    return input;
  }

  if (typeof input === 'number' || typeof input === 'boolean' || typeof input === 'bigint') {
    return String(input);
  }

  return JSON.stringify(input) ?? String(input);
}
