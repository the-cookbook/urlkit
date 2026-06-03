import type { SearchArrayFormat } from '../contracts.js';
import type { RawSearchValue } from './contracts.js';

export function readArraySearchValues(
  value: RawSearchValue | undefined,
  arrayFormat: SearchArrayFormat = 'repeat',
): readonly string[] | undefined {
  if (value === undefined) {
    return undefined;
  }

  const values: readonly string[] = Array.isArray(value) ? value : [value];

  if (arrayFormat !== 'comma') {
    return values;
  }

  return Object.freeze(values.flatMap((item) => item.split(',')));
}
