import { describe, expect, it } from 'vitest';
import { boolean } from '../schema/boolean.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { compileSearchSchema } from './compile-search-schema.js';
import { parseSearchFieldValue } from './parse-search-field-value.js';

function getField(schema: Parameters<typeof compileSearchSchema>[0], key: string) {
  const field = compileSearchSchema(schema).fields.find((item) => item.key === key);

  if (!field) {
    throw new Error(`Missing field ${key}.`);
  }

  return field;
}

describe('parseSearchFieldValue', () => {
  it('parses one-field values', () => {
    expect(parseSearchFieldValue(getField({ page: int() }, 'page'), { page: '2' })).toBe(2);
  });

  it('parses many-field values', () => {
    const parsed = parseSearchFieldValue(
      getField({ tag: { type: 'many', value: string() } }, 'tag'),
      { tag: ['react', 'router'] },
    );

    expect(parsed).toEqual(['react', 'router']);
    expect(Object.isFrozen(parsed)).toBe(true);
  });



  it('parses many-field values with comma array format', () => {
    expect(
      parseSearchFieldValue(
        getField({ tag: { type: 'many', value: string() } }, 'tag'),
        { tag: 'react,router' },
        { arrayFormat: 'comma' },
      ),
    ).toEqual(['react', 'router']);
  });

  it('parses single occurrences for many fields as one-item arrays', () => {
    expect(
      parseSearchFieldValue(getField({ tag: { type: 'many', value: string() } }, 'tag'), {
        tag: 'react',
      }),
    ).toEqual(['react']);
  });

  it('rejects repeated values for one fields', () => {
    expect(() =>
      parseSearchFieldValue(getField({ page: int() }, 'page'), { page: ['1', '2'] }),
    ).toThrow(expect.objectContaining({ code: 'invalid-search' }));
  });

  it('applies optional and defaulted absence behavior', () => {
    expect(parseSearchFieldValue(getField({ q: string().optional() }, 'q'), {})).toBeUndefined();
    expect(parseSearchFieldValue(getField({ page: int().default(1) }, 'page'), {})).toBe(1);
  });

  it('throws missing-search for required absent fields', () => {
    expect(() => parseSearchFieldValue(getField({ active: boolean() }, 'active'), {})).toThrow(
      expect.objectContaining({ code: 'missing-search' }),
    );
  });
});
