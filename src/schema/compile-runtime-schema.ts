import type {
  CompileRuntimeSchemaOptions,
  NormalizedRuntimeSchemaDescriptor,
  RuntimeSchemaBuilder,
  RuntimeSchemaOptions,
} from './contracts.js';
import { getRuntimeSchemaInternals } from './get-runtime-schema-internals.js';

export function compileRuntimeSchema<
  Value,
  Kind extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Kind, Options>,
>(
  schema: RuntimeSchemaBuilder<Value, Kind, Options, Descriptor>,
  options: CompileRuntimeSchemaOptions = {},
): Descriptor {
  const internals = getRuntimeSchemaInternals(schema);
  const descriptor = internals.toDescriptor();

  if (internals.validateDescriptor) {
    internals.validateDescriptor({
      kind: descriptor.kind,
      path: [...(options.path ?? [])],
    });
  }

  if (descriptor.presence === 'defaulted' && internals.validateDefault) {
    internals.validateDefault(descriptor.defaultValue as Value, {
      kind: descriptor.kind,
      path: [...(options.path ?? [])],
    });
  }

  return descriptor;
}
