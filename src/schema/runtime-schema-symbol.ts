import type {
  NormalizedRuntimeSchemaDescriptor,
  RuntimeSchemaBuilder,
  RuntimeSchemaInternals,
  RuntimeSchemaOptions,
} from './contracts.js';

export const runtimeSchemaSymbol: unique symbol = Symbol('urlkit.runtime-schema');

export interface RuntimeSchemaBuilderWithInternals<
  Value,
  Type extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Type, Options>,
> extends RuntimeSchemaBuilder<Value, Type, Options, Descriptor> {
  readonly [runtimeSchemaSymbol]: RuntimeSchemaInternals<Value, Type, Options, Descriptor>;
}
