import { describe, expect, it } from 'vitest';
import { object } from '../schema/object.js';
import { string } from '../schema/string.js';
import { compileSearchSchema } from './compile-search-schema.js';
import { deleteSearchFieldRawKeys } from './delete-search-field-raw-keys.js';

describe('deleteSearchFieldRawKeys', () => {
  it('deletes scalar field raw keys', () => {
    const [field] = compileSearchSchema({ q: string() }).fields;
    const raw = { q: 'router', debug: 'true' };

    deleteSearchFieldRawKeys(field!, raw);

    expect(raw).toEqual({ debug: 'true' });
  });

  it('deletes declared object field raw keys and leaves unknown nested keys', () => {
    const [field] = compileSearchSchema({ filter: object({ role: string() }) }).fields;
    const raw = { 'filter.role': 'admin', 'filter.debug': 'true' };

    deleteSearchFieldRawKeys(field!, raw);

    expect(raw).toEqual({ 'filter.debug': 'true' });
  });
});
