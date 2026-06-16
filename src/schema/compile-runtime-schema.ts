import type {
  CompileRuntimeSchemaOptions,
  NormalizedRuntimeSchemaDescriptor,
  RuntimeSchemaBuilder,
  RuntimeSchemaOptions,
} from './contracts.js';
import { getRuntimeSchemaInternals } from './get-runtime-schema-internals.js';

export function compileRuntimeSchema<
  Value,
  Type extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Type, Options>,
>(
  schema: RuntimeSchemaBuilder<Value, Type, Options, Descriptor>,
  options: CompileRuntimeSchemaOptions = {},
): Descriptor {
  const internals = getRuntimeSchemaInternals(schema);
  const descriptor = internals.toDescriptor();

  if (internals.validateDescriptor) {
    internals.validateDescriptor({
      type: descriptor.type,
      path: [...(options.path ?? [])],
    });
  }

  if (descriptor.presence === 'defaulted' && internals.validateDefault) {
    internals.validateDefault(descriptor.defaultValue as Value, {
      type: descriptor.type,
      path: [...(options.path ?? [])],
    });
  }

  return descriptor;
}
