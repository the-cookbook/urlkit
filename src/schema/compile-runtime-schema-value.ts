import type {
  CompileRuntimeSchemaOptions,
  NormalizedRuntimeSchemaDescriptor,
  RuntimeSchemaBuilder,
  RuntimeSchemaCodec,
  RuntimeSchemaOptions,
} from './contracts.js';
import { compileRuntimeSchema } from './compile-runtime-schema.js';
import { getRuntimeSchemaInternals } from './get-runtime-schema-internals.js';

export interface CompiledRuntimeSchema<Value = unknown> {
  readonly descriptor: NormalizedRuntimeSchemaDescriptor;
  readonly codec?: RuntimeSchemaCodec<Value>;
}

export function compileRuntimeSchemaValue<
  Value,
  Kind extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Kind, Options>,
>(
  schema: RuntimeSchemaBuilder<Value, Kind, Options, Descriptor>,
  options: CompileRuntimeSchemaOptions = {},
): CompiledRuntimeSchema<Value> {
  const descriptor = compileRuntimeSchema(schema, options);
  const internals = getRuntimeSchemaInternals(schema);

  return Object.freeze({
    descriptor: descriptor,
    ...(internals.codec ? { codec: internals.codec } : {}),
  });
}
