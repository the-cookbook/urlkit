import { UrlKitError } from '../errors/url-kit-error.js';
import type { RuntimeSchemaValueOptions } from './contracts.js';
import type { CompiledRuntimeSchema } from './compile-runtime-schema-value.js';
import { createSchemaValueError } from './create-schema-value-error.js';
import { handleRuntimeSchemaAbsence } from './handle-runtime-schema-absence.js';
import { createRuntimeSchemaValueContext } from './runtime-schema-value-context.js';

export function parseCompiledRuntimeSchemaValue<Value = unknown>(
  compiled: CompiledRuntimeSchema<Value>,
  input: unknown,
  options: RuntimeSchemaValueOptions = {},
): Value {
  const absence = handleRuntimeSchemaAbsence(compiled.descriptor, input, options);

  if (absence.handled) {
    return absence.value as Value;
  }

  if (typeof input !== 'string') {
    throw createSchemaValueError(
      options.errorCode ?? 'invalid-search',
      'Serialized schema values must be strings.',
      options.path ?? [],
    );
  }

  if (!compiled.codec) {
    throw new UrlKitError(
      'invalid-descriptor',
      `Runtime schema "${compiled.descriptor.kind}" does not define a parser.`,
      options.path ? { path: options.path } : undefined,
    );
  }

  try {
    return compiled.codec.parse(
      input,
      createRuntimeSchemaValueContext(compiled.descriptor.kind, options),
    );
  } catch (error) {
    if (error instanceof UrlKitError) {
      throw error;
    }

    throw createSchemaValueError(
      options.errorCode ?? 'invalid-search',
      'Schema value is invalid.',
      options.path ?? [],
      error,
    );
  }
}
