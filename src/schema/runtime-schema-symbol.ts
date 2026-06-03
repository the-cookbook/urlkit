import type {
  NormalizedRuntimeSchemaDescriptor,
  RuntimeSchemaBuilder,
  RuntimeSchemaInternals,
  RuntimeSchemaOptions,
} from './contracts.js';

export const runtimeSchemaSymbol: unique symbol = Symbol('urlkit.runtime-schema');

export interface RuntimeSchemaBuilderWithInternals<
  Value,
  Kind extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Kind, Options>,
> extends RuntimeSchemaBuilder<Value, Kind, Options, Descriptor> {
  readonly [runtimeSchemaSymbol]: RuntimeSchemaInternals<Value, Kind, Options, Descriptor>;
}
