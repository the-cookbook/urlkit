import type { BuildSearchOptions } from '../contracts.js';
import type { SearchEntry } from './search-entries.js';

export function serializeSearchEntries(
  entries: readonly SearchEntry[],
  options: BuildSearchOptions = {},
): string {
  if (!entries.length) {
    return '';
  }

  const orderedEntries = options.sortKeys ? [...entries].sort(compareSearchEntryKeys) : entries;
  const searchParams = new URLSearchParams();

  for (const entry of orderedEntries) {
    searchParams.append(entry.key, entry.value);
  }

  const search = searchParams.toString();

  return search ? `?${search}` : '';
}

function compareSearchEntryKeys(left: SearchEntry, right: SearchEntry): number {
  return left.key.localeCompare(right.key);
}
