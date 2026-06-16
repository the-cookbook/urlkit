import type { UrlKitErrorCode } from '../errors/contracts.js';
import type { UrlKitError } from '../errors/url-kit-error.js';

export type RuntimeSchemaPresence = 'required' | 'optional' | 'defaulted';

export type RuntimeSchemaOptions = Readonly<Record<string, unknown>>;

export type EmptyRuntimeSchemaOptions = Readonly<Record<never, never>>;

export interface RuntimeDefaultValidationContext {
  readonly type: string;
  readonly path: readonly string[];
}

export interface RuntimeSchemaValueContext {
  readonly type: string;
  readonly path: readonly string[];
  readonly errorCode: UrlKitErrorCode;
}

export interface RuntimeSchemaValueOptions {
  readonly path?: readonly string[];
  readonly errorCode?: UrlKitErrorCode;
  readonly missingCode?: UrlKitErrorCode;
}

export type RuntimeDefaultValidator<Value = unknown> = (
  value: Value,
  context: RuntimeDefaultValidationContext,
) => void;

export type RuntimeDescriptorValidator = (context: RuntimeDefaultValidationContext) => void;

export interface RuntimeSchemaCodec<Value> {
  readonly parse: (input: string, context: RuntimeSchemaValueContext) => Value;
  readonly normalize: (input: unknown, context: RuntimeSchemaValueContext) => Value;
  readonly serialize: (input: Value, context: RuntimeSchemaValueContext) => string;
}

export interface RuntimeSchemaDefinition<
  Type extends string,
  Options extends RuntimeSchemaOptions,
  Value,
> {
  readonly type: Type;
  readonly options?: Options;
  readonly codec?: RuntimeSchemaCodec<Value>;
  readonly validateDefault?: RuntimeDefaultValidator<Value>;
  readonly validateDescriptor?: RuntimeDescriptorValidator;
}

export interface BaseRuntimeSchemaDescriptor<
  Type extends string,
  Options extends RuntimeSchemaOptions,
> {
  readonly type: Type;
  readonly presence: RuntimeSchemaPresence;
  readonly options: Options;
}

export interface RequiredRuntimeSchemaDescriptor<
  Type extends string = string,
  Options extends RuntimeSchemaOptions = RuntimeSchemaOptions,
> extends BaseRuntimeSchemaDescriptor<Type, Options> {
  readonly presence: 'required';
}

export interface OptionalRuntimeSchemaDescriptor<
  Type extends string = string,
  Options extends RuntimeSchemaOptions = RuntimeSchemaOptions,
> extends BaseRuntimeSchemaDescriptor<Type, Options> {
  readonly presence: 'optional';
}

export interface DefaultedRuntimeSchemaDescriptor<
  Type extends string = string,
  Options extends RuntimeSchemaOptions = RuntimeSchemaOptions,
  DefaultValue = unknown,
> extends BaseRuntimeSchemaDescriptor<Type, Options> {
  readonly presence: 'defaulted';
  readonly defaultValue: DefaultValue;
}

export type NormalizedRuntimeSchemaDescriptor<
  Type extends string = string,
  Options extends RuntimeSchemaOptions = RuntimeSchemaOptions,
  DefaultValue = unknown,
> =
  | RequiredRuntimeSchemaDescriptor<Type, Options>
  | OptionalRuntimeSchemaDescriptor<Type, Options>
  | DefaultedRuntimeSchemaDescriptor<Type, Options, DefaultValue>;

export interface RuntimeSchemaInternals<
  Value,
  Type extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Type, Options>,
> {
  readonly type: Type;
  readonly presence: Descriptor['presence'];
  readonly options: Options;
  readonly defaultValue?: unknown;
  readonly codec?: RuntimeSchemaCodec<Value>;
  readonly validateDefault?: RuntimeDefaultValidator<Value>;
  readonly validateDescriptor?: RuntimeDescriptorValidator;
  readonly toDescriptor: () => Descriptor;
}

declare const runtimeSchemaTypeSymbol: unique symbol;

export interface RuntimeSchemaBuilder<
  Value,
  Type extends string = string,
  Options extends RuntimeSchemaOptions = RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Type, Options> =
    NormalizedRuntimeSchemaDescriptor<Type, Options>,
> {
  readonly [runtimeSchemaTypeSymbol]?: {
    readonly value: Value;
    readonly type: Type;
    readonly options: Options;
    readonly descriptor: Descriptor;
  };
  readonly optional: () => RuntimeSchemaBuilder<
    Value | undefined,
    Type,
    Options,
    OptionalRuntimeSchemaDescriptor<Type, Options>
  >;
  readonly required: () => RuntimeSchemaBuilder<
    NonNullable<Value>,
    Type,
    Options,
    RequiredRuntimeSchemaDescriptor<Type, Options>
  >;
  readonly default: (
    value: NonNullable<Value>,
  ) => RuntimeSchemaBuilder<
    NonNullable<Value>,
    Type,
    Options,
    DefaultedRuntimeSchemaDescriptor<Type, Options, NonNullable<Value>>
  >;
}

export interface CompileRuntimeSchemaOptions {
  readonly path?: readonly string[];
}

export type AnyRuntimeSchemaBuilder = RuntimeSchemaBuilder<any, any, any, any>;

export type InferRuntimeSchemaValue<Schema> =
  Schema extends RuntimeSchemaBuilder<infer Value> ? Value : never;

export type InferRuntimeSchemaDescriptor<Schema> =
  Schema extends RuntimeSchemaBuilder<any, any, any, infer Descriptor> ? Descriptor : never;

export interface RuntimeSchemaSafeSuccess<Value> {
  readonly success: true;
  readonly data: Value;
}

export interface RuntimeSchemaSafeFailure {
  readonly success: false;
  readonly error: UrlKitError;
}

export type RuntimeSchemaSafeResult<Value> =
  | RuntimeSchemaSafeSuccess<Value>
  | RuntimeSchemaSafeFailure;
