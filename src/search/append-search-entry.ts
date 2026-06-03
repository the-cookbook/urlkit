import type { BuildSearchOptions } from '../contracts.js';
import type { SearchEntry } from './search-entries.js';

export function appendSearchEntry(
  entries: SearchEntry[],
  key: string,
  value: string | readonly string[] | undefined,
  options: BuildSearchOptions = {},
): void {
  if (value === undefined) {
    return;
  }

  if (typeof value === 'string') {
    entries.push({ key, value });
    return;
  }

  appendArraySearchEntry(entries, key, value, options);
}

function appendArraySearchEntry(
  entries: SearchEntry[],
  key: string,
  values: readonly string[],
  options: BuildSearchOptions,
): void {
  if (!values.length) {
    return;
  }

  if (options.arrayFormat === 'comma') {
    entries.push({ key, value: values.join(',') });
    return;
  }

  for (const value of values) {
    entries.push({ key, value });
  }
}
