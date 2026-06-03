import { UrlKitError } from '../errors/url-kit-error.js';
import { compileRuntimeSchemaValue } from '../schema/compile-runtime-schema-value.js';
import type { RuntimeSchemaBuilder, RuntimeSchemaOptions } from '../schema/contracts.js';
import { normalizeCompiledRuntimeSchemaValue } from '../schema/normalize-compiled-runtime-schema-value.js';
import { parseCompiledRuntimeSchemaValue } from '../schema/parse-compiled-runtime-schema-value.js';
import { serializeCompiledRuntimeSchemaValue } from '../schema/serialize-compiled-runtime-schema-value.js';
import type { CompiledHashDescriptor, NormalizedHashDescriptor } from './contracts.js';

const HASH_PATH = Object.freeze(['hash']);

export function compileRuntimeHashDescriptor(
  schema: RuntimeSchemaBuilder<any, 'string' | 'enum'>,
): CompiledHashDescriptor<string | undefined> {
  const compiledSchema = compileRuntimeSchemaValue(schema, { path: HASH_PATH });
  const descriptor = compiledSchema.descriptor;

  if (descriptor.kind !== 'string' && descriptor.kind !== 'enum') {
    throw new UrlKitError('invalid-descriptor', 'Hash schema must be a string or enum schema.', {
      path: HASH_PATH,
    });
  }

  return Object.freeze({
    descriptor: toNormalizedHashDescriptor(
      descriptor as {
        readonly kind: 'string' | 'enum';
        readonly presence: 'required' | 'optional' | 'defaulted';
        readonly options: RuntimeSchemaOptions;
        readonly defaultValue?: unknown;
      },
    ),
    parse(input: unknown) {
      return parseCompiledRuntimeSchemaValue(compiledSchema, input, {
        path: HASH_PATH,
        errorCode: 'invalid-hash',
        missingCode: 'invalid-hash',
      }) as string | undefined;
    },
    normalize(input: unknown) {
      return normalizeCompiledRuntimeSchemaValue(compiledSchema, input, {
        path: HASH_PATH,
        errorCode: 'invalid-hash',
        missingCode: 'invalid-hash',
      }) as string | undefined;
    },
    serialize(input: unknown) {
      return serializeCompiledRuntimeSchemaValue(compiledSchema, input, {
        path: HASH_PATH,
        errorCode: 'invalid-hash',
        missingCode: 'invalid-hash',
      });
    },
    isDefault(input: unknown) {
      if (descriptor.presence !== 'defaulted') {
        return false;
      }

      return (
        normalizeCompiledRuntimeSchemaValue(compiledSchema, input, {
          path: HASH_PATH,
          errorCode: 'invalid-hash',
          missingCode: 'invalid-hash',
        }) === descriptor.defaultValue
      );
    },
  });
}

function toNormalizedHashDescriptor(descriptor: {
  readonly kind: 'string' | 'enum';
  readonly presence: 'required' | 'optional' | 'defaulted';
  readonly options: RuntimeSchemaOptions;
  readonly defaultValue?: unknown;
}): NormalizedHashDescriptor<string | undefined> {
  const values = isStringArray(descriptor.options.values)
    ? [...descriptor.options.values]
    : undefined;

  if (descriptor.presence === 'defaulted') {
    return Object.freeze({
      kind: descriptor.kind,
      presence: 'defaulted',
      ...(values ? { values: Object.freeze(values) } : {}),
      defaultValue: descriptor.defaultValue as string,
    });
  }

  return Object.freeze({
    kind: descriptor.kind,
    presence: descriptor.presence,
    ...(values ? { values: Object.freeze(values) } : {}),
  });
}

function isStringArray(input: unknown): input is readonly string[] {
  return Array.isArray(input) && input.every((value) => typeof value === 'string');
}
