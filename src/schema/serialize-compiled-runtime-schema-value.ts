import { UrlKitError } from '../errors/url-kit-error.js';
import type { RuntimeSchemaValueOptions } from './contracts.js';
import type { CompiledRuntimeSchema } from './compile-runtime-schema-value.js';
import { createSchemaValueError } from './create-schema-value-error.js';
import { handleRuntimeSchemaAbsence } from './handle-runtime-schema-absence.js';
import { createRuntimeSchemaValueContext } from './runtime-schema-value-context.js';

export function serializeCompiledRuntimeSchemaValue<Value = unknown>(
  compiled: CompiledRuntimeSchema<Value>,
  input: unknown,
  options: RuntimeSchemaValueOptions = {},
): string | undefined {
  const absence = handleRuntimeSchemaAbsence(compiled.descriptor, input, options);

  if (absence.handled) {
    if (absence.value === undefined) {
      return undefined;
    }

    input = absence.value;
  }

  if (!compiled.codec) {
    throw new UrlKitError(
      'invalid-descriptor',
      `Runtime schema "${compiled.descriptor.kind}" does not define a serializer.`,
      options.path ? { path: options.path } : undefined,
    );
  }

  try {
    const context = createRuntimeSchemaValueContext(compiled.descriptor.kind, options);
    const normalized = compiled.codec.normalize(input, context);
    return compiled.codec.serialize(normalized, context);
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
