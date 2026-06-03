import { UrlKitError } from '../errors/url-kit-error.js';
import { compileRuntimeSchemaValue } from '../schema/compile-runtime-schema-value.js';
import { getRuntimeSchemaInternals } from '../schema/get-runtime-schema-internals.js';
import type {
  AnyRuntimeSchemaBuilder,
  CompiledSearchField,
  CompiledSearchSchema,
  RuntimeSearchField,
  RuntimeSearchSchema,
} from './contracts.js';
import { isRuntimeSearchField } from './is-runtime-search-field.js';
import { normalizeSearchFieldDefault } from './normalize-search-field-default.js';
import { normalizeSearchFieldType } from './normalize-search-field-type.js';

export function compileSearchSchema(schema: RuntimeSearchSchema): CompiledSearchSchema {
  if (!isSearchSchema(schema)) {
    throw new UrlKitError('invalid-descriptor', 'Search schema must be an object.');
  }

  const fields = Object.freeze(
    Object.entries(schema).map(([key, field]) => compileSearchField(key, field)),
  );
  const keys = new Set(fields.map((field) => field.key));

  return Object.freeze({ fields, keys });
}

function compileSearchField(key: string, field: RuntimeSearchSchema[string]): CompiledSearchField {
  if (isRuntimeSearchField(field)) {
    return compileSearchFieldObject(key, field);
  }

  return compileSearchRuntimeSchemaField(key, field);
}

function compileSearchRuntimeSchemaField(
  key: string,
  schema: AnyRuntimeSchemaBuilder,
): CompiledSearchField {
  const compiledSchema = compileRuntimeSchemaValue(schema, { path: [key] });
  const descriptor = compiledSchema.descriptor;

  return Object.freeze({
    key,
    type: 'one',
    schema,
    compiledSchema,
    presence: descriptor.presence,
    ...(descriptor.presence === 'defaulted' ? { defaultValue: descriptor.defaultValue } : {}),
  });
}

function compileSearchFieldObject(key: string, field: RuntimeSearchField): CompiledSearchField {
  const path = [key];
  const fieldType = normalizeSearchFieldType(field.type);

  getRuntimeSchemaInternals(field.value);
  const compiledSchema = compileRuntimeSchemaValue(field.value, { path });
  const descriptor = compiledSchema.descriptor;
  const hasDefault = Object.prototype.hasOwnProperty.call(field, 'default');
  const presence = hasDefault
    ? 'defaulted'
    : field.optional
      ? 'optional'
      : fieldType === 'many'
        ? 'required'
        : descriptor.presence;
  const defaultValue = hasDefault
    ? normalizeSearchFieldDefault(fieldType, field.value, field.default, path)
    : descriptor.presence === 'defaulted' && fieldType === 'one'
      ? descriptor.defaultValue
      : undefined;

  return Object.freeze({
    key,
    type: fieldType,
    schema: field.value,
    compiledSchema,
    presence,
    ...(presence === 'defaulted' ? { defaultValue } : {}),
  });
}

function isSearchSchema(input: unknown): input is RuntimeSearchSchema {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}
