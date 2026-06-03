import type { UrlKitErrorCode } from '../errors/contracts.js';
import type { UrlKitError } from '../errors/url-kit-error.js';

export type RuntimeSchemaPresence = 'required' | 'optional' | 'defaulted';

export type RuntimeSchemaOptions = Readonly<Record<string, unknown>>;

export type EmptyRuntimeSchemaOptions = Readonly<Record<never, never>>;

export interface RuntimeDefaultValidationContext {
  readonly kind: string;
  readonly path: readonly string[];
}

export interface RuntimeSchemaValueContext {
  readonly kind: string;
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
  Kind extends string,
  Options extends RuntimeSchemaOptions,
  Value,
> {
  readonly kind: Kind;
  readonly options?: Options;
  readonly codec?: RuntimeSchemaCodec<Value>;
  readonly validateDefault?: RuntimeDefaultValidator<Value>;
  readonly validateDescriptor?: RuntimeDescriptorValidator;
}

export interface BaseRuntimeSchemaDescriptor<
  Kind extends string,
  Options extends RuntimeSchemaOptions,
> {
  readonly kind: Kind;
  readonly presence: RuntimeSchemaPresence;
  readonly options: Options;
}

export interface RequiredRuntimeSchemaDescriptor<
  Kind extends string = string,
  Options extends RuntimeSchemaOptions = RuntimeSchemaOptions,
> extends BaseRuntimeSchemaDescriptor<Kind, Options> {
  readonly presence: 'required';
}

export interface OptionalRuntimeSchemaDescriptor<
  Kind extends string = string,
  Options extends RuntimeSchemaOptions = RuntimeSchemaOptions,
> extends BaseRuntimeSchemaDescriptor<Kind, Options> {
  readonly presence: 'optional';
}

export interface DefaultedRuntimeSchemaDescriptor<
  Kind extends string = string,
  Options extends RuntimeSchemaOptions = RuntimeSchemaOptions,
  DefaultValue = unknown,
> extends BaseRuntimeSchemaDescriptor<Kind, Options> {
  readonly presence: 'defaulted';
  readonly defaultValue: DefaultValue;
}

export type NormalizedRuntimeSchemaDescriptor<
  Kind extends string = string,
  Options extends RuntimeSchemaOptions = RuntimeSchemaOptions,
  DefaultValue = unknown,
> =
  | RequiredRuntimeSchemaDescriptor<Kind, Options>
  | OptionalRuntimeSchemaDescriptor<Kind, Options>
  | DefaultedRuntimeSchemaDescriptor<Kind, Options, DefaultValue>;

export interface RuntimeSchemaInternals<
  Value,
  Kind extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Kind, Options>,
> {
  readonly kind: Kind;
  readonly presence: Descriptor['presence'];
  readonly options: Options;
  readonly defaultValue?: unknown;
  readonly codec?: RuntimeSchemaCodec<Value>;
  readonly validateDefault?: RuntimeDefaultValidator<Value>;
  readonly validateDescriptor?: RuntimeDescriptorValidator;
  readonly toDescriptor: () => Descriptor;
}

export interface RuntimeSchemaBuilder<
  Value,
  Kind extends string = string,
  Options extends RuntimeSchemaOptions = RuntimeSchemaOptions,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Kind, Options> =
    NormalizedRuntimeSchemaDescriptor<Kind, Options>,
> {
  readonly optional: () => RuntimeSchemaBuilder<
    Value | undefined,
    Kind,
    Options,
    OptionalRuntimeSchemaDescriptor<Kind, Options>
  >;
  readonly required: () => RuntimeSchemaBuilder<
    NonNullable<Value>,
    Kind,
    Options,
    RequiredRuntimeSchemaDescriptor<Kind, Options>
  >;
  readonly default: (
    value: NonNullable<Value>,
  ) => RuntimeSchemaBuilder<
    NonNullable<Value>,
    Kind,
    Options,
    DefaultedRuntimeSchemaDescriptor<Kind, Options, NonNullable<Value>>
  >;
}

export interface CompileRuntimeSchemaOptions {
  readonly path?: readonly string[];
}

export type AnyRuntimeSchemaBuilder = RuntimeSchemaBuilder<any, any, any, any>;

export type InferRuntimeSchemaValue<Schema> =
  Schema extends RuntimeSchemaBuilder<infer Value> ? Value : never;

export type InferRuntimeSchemaDescriptor<Schema> =
  Schema extends RuntimeSchemaBuilder<unknown, string, RuntimeSchemaOptions, infer Descriptor>
    ? Descriptor
    : never;

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
