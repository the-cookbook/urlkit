import { UrlKitError } from '../errors/url-kit-error.js';
import { normalizeCompiledRuntimeSchemaValue } from '../schema/normalize-compiled-runtime-schema-value.js';
import { isRuntimeSchemaType } from '../schema/is-runtime-schema-type.js';
import type { CompiledSearchField } from './contracts.js';

export function normalizeSearchBuildValue(field: CompiledSearchField, input: unknown): unknown {
  if (isRuntimeSchemaType(field.schema, 'array') || isRuntimeSchemaType(field.schema, 'object')) {
    return normalizeCompiledRuntimeSchemaValue(field.compiledSchema, input, {
      path: [field.key],
      errorCode: 'invalid-search',
      missingCode: 'missing-search',
    });
  }

  if (field.type === 'many') {
    return normalizeManySearchBuildValue(field, input);
  }

  return normalizeOneSearchBuildValue(field, input);
}

function normalizeOneSearchBuildValue(field: CompiledSearchField, input: unknown): unknown {
  if (input === undefined || input === null) {
    if (field.presence === 'optional') {
      return undefined;
    }

    if (field.presence === 'defaulted') {
      return field.defaultValue;
    }

    if (input === null) {
      throw new UrlKitError('invalid-search', 'Required search parameter cannot be null.', {
        path: [field.key],
      });
    }

    throw new UrlKitError('missing-search', 'Required search parameter is missing.', {
      path: [field.key],
    });
  }

  return normalizeCompiledRuntimeSchemaValue(field.compiledSchema, input, {
    path: [field.key],
    errorCode: 'invalid-search',
    missingCode: 'missing-search',
  });
}

function normalizeManySearchBuildValue(
  field: CompiledSearchField,
  input: unknown,
): readonly unknown[] | undefined {
  if (input === undefined || input === null) {
    if (field.presence === 'optional') {
      return undefined;
    }

    if (field.presence === 'defaulted') {
      return copyArrayDefault(field);
    }

    if (input === null) {
      throw new UrlKitError('invalid-search', 'Required search parameter cannot be null.', {
        path: [field.key],
      });
    }

    throw new UrlKitError('missing-search', 'Required search parameter is missing.', {
      path: [field.key],
    });
  }

  if (!Array.isArray(input)) {
    throw new UrlKitError('invalid-search', 'Expected an array search parameter value.', {
      path: [field.key],
    });
  }

  return Object.freeze(
    input.map((item) =>
      normalizeCompiledRuntimeSchemaValue(field.compiledSchema, item, {
        path: [field.key],
        errorCode: 'invalid-search',
        missingCode: 'missing-search',
      }),
    ),
  );
}

function copyArrayDefault(field: CompiledSearchField): readonly unknown[] {
  const value = field.defaultValue;

  if (!Array.isArray(value)) {
    return Object.freeze([]);
  }

  return Object.freeze([...value]);
}
