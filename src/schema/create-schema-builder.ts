import type {
  DefaultedRuntimeSchemaDescriptor,
  EmptyRuntimeSchemaOptions,
  NormalizedRuntimeSchemaDescriptor,
  OptionalRuntimeSchemaDescriptor,
  RequiredRuntimeSchemaDescriptor,
  RuntimeDefaultValidator,
  RuntimeDescriptorValidator,
  RuntimeSchemaBuilder,
  RuntimeSchemaCodec,
  RuntimeSchemaDefinition,
  RuntimeSchemaOptions,
} from './contracts.js';
import {
  runtimeSchemaSymbol,
  type RuntimeSchemaBuilderWithInternals,
} from './runtime-schema-symbol.js';

interface RuntimeSchemaState<
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
}

export function createRuntimeSchemaBuilder<
  Value,
  const Kind extends string,
  Options extends RuntimeSchemaOptions = EmptyRuntimeSchemaOptions,
>(
  definition: RuntimeSchemaDefinition<Kind, Options, Value>,
): RuntimeSchemaBuilder<Value, Kind, Options, RequiredRuntimeSchemaDescriptor<Kind, Options>> {
  return createBuilder<Value, Kind, Options, RequiredRuntimeSchemaDescriptor<Kind, Options>>({
    kind: definition.kind,
    presence: 'required',
    options: copyOptions(definition.options),
    ...(definition.codec ? { codec: definition.codec } : {}),
    ...(definition.validateDefault ? { validateDefault: definition.validateDefault } : {}),
    ...(definition.validateDescriptor ? { validateDescriptor: definition.validateDescriptor } : {}),
  });
}

function createBuilder<
  Value,
  Kind extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Kind, Options>,
>(
  state: RuntimeSchemaState<Value, Kind, Options, Descriptor>,
): RuntimeSchemaBuilderWithInternals<Value, Kind, Options, Descriptor> {
  const internals = Object.freeze({
    kind: state.kind,
    presence: state.presence,
    options: state.options,
    ...(state.defaultValue !== undefined ? { defaultValue: state.defaultValue } : {}),
    ...(state.codec ? { codec: state.codec } : {}),
    ...(state.validateDefault ? { validateDefault: state.validateDefault } : {}),
    ...(state.validateDescriptor ? { validateDescriptor: state.validateDescriptor } : {}),
    toDescriptor: () => createDescriptor(state),
  });

  const builder = {
    [runtimeSchemaSymbol]: internals,

    optional: () => {
      if (state.presence === 'defaulted') {
        return createBuilder(
          copyDefaultedState<Value, Kind, Options, Descriptor>(state),
        ) as unknown as RuntimeSchemaBuilder<
          Value | undefined,
          Kind,
          Options,
          OptionalRuntimeSchemaDescriptor<Kind, Options>
        >;
      }

      const nextState = {
        kind: state.kind,
        presence: 'optional',
        options: state.options,
        ...(state.codec ? { codec: state.codec as RuntimeSchemaCodec<Value | undefined> } : {}),
        ...(state.validateDefault
          ? { validateDefault: state.validateDefault as RuntimeDefaultValidator<Value | undefined> }
          : {}),
        ...(state.validateDescriptor ? { validateDescriptor: state.validateDescriptor } : {}),
      } satisfies RuntimeSchemaState<
        Value | undefined,
        Kind,
        Options,
        OptionalRuntimeSchemaDescriptor<Kind, Options>
      >;

      return createBuilder<
        Value | undefined,
        Kind,
        Options,
        OptionalRuntimeSchemaDescriptor<Kind, Options>
      >(nextState);
    },

    required: () => {
      if (state.presence === 'defaulted') {
        return createBuilder(
          copyDefaultedState<Value, Kind, Options, Descriptor>(state),
        ) as unknown as RuntimeSchemaBuilder<
          NonNullable<Value>,
          Kind,
          Options,
          RequiredRuntimeSchemaDescriptor<Kind, Options>
        >;
      }

      const nextState = {
        kind: state.kind,
        presence: 'required',
        options: state.options,
        ...(state.codec ? { codec: state.codec as RuntimeSchemaCodec<NonNullable<Value>> } : {}),
        ...(state.validateDefault
          ? {
              validateDefault: state.validateDefault,
            }
          : {}),
        ...(state.validateDescriptor ? { validateDescriptor: state.validateDescriptor } : {}),
      } satisfies RuntimeSchemaState<
        NonNullable<Value>,
        Kind,
        Options,
        RequiredRuntimeSchemaDescriptor<Kind, Options>
      >;

      return createBuilder<
        NonNullable<Value>,
        Kind,
        Options,
        RequiredRuntimeSchemaDescriptor<Kind, Options>
      >(nextState);
    },

    default: (value: NonNullable<Value>) => {
      const nextState = {
        kind: state.kind,
        presence: 'defaulted',
        options: state.options,
        defaultValue: value,
        ...(state.codec ? { codec: state.codec as RuntimeSchemaCodec<NonNullable<Value>> } : {}),
        ...(state.validateDefault
          ? {
              validateDefault: state.validateDefault,
            }
          : {}),
        ...(state.validateDescriptor ? { validateDescriptor: state.validateDescriptor } : {}),
      } satisfies RuntimeSchemaState<
        NonNullable<Value>,
        Kind,
        Options,
        DefaultedRuntimeSchemaDescriptor<Kind, Options, NonNullable<Value>>
      >;

      return createBuilder<
        NonNullable<Value>,
        Kind,
        Options,
        DefaultedRuntimeSchemaDescriptor<Kind, Options, NonNullable<Value>>
      >(nextState);
    },
  } satisfies RuntimeSchemaBuilderWithInternals<Value, Kind, Options, Descriptor>;

  return Object.freeze(builder);
}

function copyDefaultedState<
  Value,
  Kind extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Kind, Options>,
>(
  state: RuntimeSchemaState<Value, Kind, Options, Descriptor>,
): RuntimeSchemaState<NonNullable<Value>, Kind, Options, Descriptor> {
  return {
    kind: state.kind,
    presence: 'defaulted',
    options: state.options,
    defaultValue: state.defaultValue,
    ...(state.codec ? { codec: state.codec as RuntimeSchemaCodec<NonNullable<Value>> } : {}),
    ...(state.validateDefault ? { validateDefault: state.validateDefault } : {}),
    ...(state.validateDescriptor ? { validateDescriptor: state.validateDescriptor } : {}),
  };
}

function createDescriptor<
  Value,
  Kind extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Kind, Options>,
>(state: RuntimeSchemaState<Value, Kind, Options, Descriptor>): Descriptor {
  const base = {
    kind: state.kind,
    presence: state.presence,
    options: copyOptions(state.options),
  };

  if (state.presence === 'defaulted') {
    return Object.freeze({
      ...base,
      presence: 'defaulted',
      defaultValue: state.defaultValue,
    }) as Descriptor;
  }

  return Object.freeze(base) as Descriptor;
}

function copyOptions<Options extends RuntimeSchemaOptions>(options: Options | undefined): Options {
  return Object.freeze({ ...(options ?? {}) }) as Options;
}
