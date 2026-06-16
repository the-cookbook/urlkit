import { describe, expect, it } from 'vitest';
import { UrlKitError } from '../errors/url-kit-error.js';
import { createRuntimeSchemaBuilder } from '../schema/create-schema-builder.js';
import { int } from '../schema/int.js';
import { string } from '../schema/string.js';
import { compileSearchSchema } from './compile-search-schema.js';
import { buildCompiledSearch } from './build-compiled-search.js';
import { normalizeCompiledSearch } from './normalize-compiled-search.js';
import { parseCompiledSearch } from './parse-compiled-search.js';
import { parseRawSearch } from './parse-raw-search.js';

describe('compileSearchSchema', () => {
  it('compiles direct runtime schema fields as one fields', () => {
    expect(compileSearchSchema({ q: string() })).toMatchObject({
      fields: [
        {
          key: 'q',
          type: 'one',
          presence: 'required',
        },
      ],
    });
  });

  it('compiles optional and defaulted direct runtime schema fields', () => {
    expect(compileSearchSchema({ q: string().optional(), page: int().default(1) })).toMatchObject({
      fields: [
        {
          key: 'q',
          type: 'one',
          presence: 'optional',
        },
        {
          key: 'page',
          type: 'one',
          presence: 'defaulted',
          defaultValue: 1,
        },
      ],
    });
  });

  it('compiles many field objects', () => {
    expect(
      compileSearchSchema({ tag: { type: 'many', value: string(), optional: true } }),
    ).toMatchObject({
      fields: [
        {
          key: 'tag',
          type: 'many',
          presence: 'optional',
        },
      ],
    });
  });

  it('normalizes field object defaults at compile time', () => {
    const compiled = compileSearchSchema({ page: { value: int(), default: 1 } });

    expect(compiled.fields[0]).toMatchObject({
      key: 'page',
      type: 'one',
      presence: 'defaulted',
      defaultValue: 1,
    });
  });

  it('normalizes many defaults at compile time', () => {
    const compiled = compileSearchSchema({
      tag: { type: 'many', value: string(), default: ['react'] },
    });

    expect(compiled.fields[0]).toMatchObject({
      key: 'tag',
      type: 'many',
      presence: 'defaulted',
      defaultValue: ['react'],
    });
    expect(Object.isFrozen(compiled.fields[0]!.defaultValue)).toBe(true);
  });

  it('stores compiled schema data and key set for hot-path reuse', () => {
    const compiled = compileSearchSchema({ q: string(), page: int().default(1) });

    expect(compiled.keys.has('q')).toBe(true);
    expect(compiled.keys.has('page')).toBe(true);
    expect(compiled.fields[0]!.compiledSchema.descriptor).toEqual({
      type: 'string',
      presence: 'required',
      options: {},
    });
    expect(compiled.fields[1]!.compiledSchema.descriptor).toMatchObject({
      type: 'int',
      presence: 'defaulted',
      defaultValue: 1,
    });
  });

  it('does not rerun descriptor validation during repeated compiled parse/build/normalize calls', () => {
    let validations = 0;
    const schema = createRuntimeSchemaBuilder<string, 'tracked'>({
      type: 'tracked',
      codec: {
        parse: (input) => input,
        normalize: (input) => String(input),
        serialize: (input) => input,
      },
      validateDescriptor() {
        validations += 1;
      },
    });
    const compiled = compileSearchSchema({ q: schema });

    expect(validations).toBe(1);
    parseCompiledSearch(parseRawSearch('?q=a'), compiled);
    parseCompiledSearch(parseRawSearch('?q=b'), compiled);
    normalizeCompiledSearch({ q: 'c' }, compiled);
    buildCompiledSearch({ q: 'd' }, compiled);

    expect(validations).toBe(1);
  });

  it('rejects invalid search schema descriptors', () => {
    expect(() => compileSearchSchema(null as never)).toThrow(UrlKitError);
    expect(() => compileSearchSchema({ q: { type: 'some', value: string() } as never })).toThrow(
      expect.objectContaining({ code: 'invalid-descriptor' }),
    );
  });

  it('rejects invalid field defaults at compile time', () => {
    expect(() => compileSearchSchema({ page: { value: int(), default: 1.5 } })).toThrow(
      expect.objectContaining({ code: 'invalid-descriptor' }),
    );
  });

  it('freezes compiled schema output', () => {
    const compiled = compileSearchSchema({ q: string() });

    expect(Object.isFrozen(compiled)).toBe(true);
    expect(Object.isFrozen(compiled.fields)).toBe(true);
    expect(Object.isFrozen(compiled.fields[0])).toBe(true);
  });
});
