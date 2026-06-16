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
}

export function createRuntimeSchemaBuilder<
  Value,
  const Type extends string,
  Options extends RuntimeSchemaOptions = EmptyRuntimeSchemaOptions,
>(
  definition: RuntimeSchemaDefinition<Type, Options, Value>,
): RuntimeSchemaBuilder<Value, Type, Options, RequiredRuntimeSchemaDescriptor<Type, Options>> {
  return createBuilder<Value, Type, Options, RequiredRuntimeSchemaDescriptor<Type, Options>>({
    type: definition.type,
    presence: 'required',
    options: copyOptions(definition.options),
    ...(definition.codec ? { codec: definition.codec } : {}),
    ...(definition.validateDefault ? { validateDefault: definition.validateDefault } : {}),
    ...(definition.validateDescriptor ? { validateDescriptor: definition.validateDescriptor } : {}),
  });
}

function createBuilder<
  Value,
  Type extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Type, Options>,
>(
  state: RuntimeSchemaState<Value, Type, Options, Descriptor>,
): RuntimeSchemaBuilderWithInternals<Value, Type, Options, Descriptor> {
  const internals = Object.freeze({
    type: state.type,
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
          copyDefaultedState<Value, Type, Options, Descriptor>(state),
        ) as unknown as RuntimeSchemaBuilder<
          Value | undefined,
          Type,
          Options,
          OptionalRuntimeSchemaDescriptor<Type, Options>
        >;
      }

      const nextState = {
        type: state.type,
        presence: 'optional',
        options: state.options,
        ...(state.codec ? { codec: state.codec as RuntimeSchemaCodec<Value | undefined> } : {}),
        ...(state.validateDefault
          ? { validateDefault: state.validateDefault as RuntimeDefaultValidator<Value | undefined> }
          : {}),
        ...(state.validateDescriptor ? { validateDescriptor: state.validateDescriptor } : {}),
      } satisfies RuntimeSchemaState<
        Value | undefined,
        Type,
        Options,
        OptionalRuntimeSchemaDescriptor<Type, Options>
      >;

      return createBuilder<
        Value | undefined,
        Type,
        Options,
        OptionalRuntimeSchemaDescriptor<Type, Options>
      >(nextState);
    },

    required: () => {
      if (state.presence === 'defaulted') {
        return createBuilder(
          copyDefaultedState<Value, Type, Options, Descriptor>(state),
        ) as unknown as RuntimeSchemaBuilder<
          NonNullable<Value>,
          Type,
          Options,
          RequiredRuntimeSchemaDescriptor<Type, Options>
        >;
      }

      const nextState = {
        type: state.type,
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
        Type,
        Options,
        RequiredRuntimeSchemaDescriptor<Type, Options>
      >;

      return createBuilder<
        NonNullable<Value>,
        Type,
        Options,
        RequiredRuntimeSchemaDescriptor<Type, Options>
      >(nextState);
    },

    default: (value: NonNullable<Value>) => {
      const nextState = {
        type: state.type,
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
        Type,
        Options,
        DefaultedRuntimeSchemaDescriptor<Type, Options, NonNullable<Value>>
      >;

      return createBuilder<
        NonNullable<Value>,
        Type,
        Options,
        DefaultedRuntimeSchemaDescriptor<Type, Options, NonNullable<Value>>
      >(nextState);
    },
  } satisfies RuntimeSchemaBuilderWithInternals<Value, Type, Options, Descriptor>;

  return Object.freeze(builder);
}

function copyDefaultedState<
  Value,
  Type extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Type, Options>,
>(
  state: RuntimeSchemaState<Value, Type, Options, Descriptor>,
): RuntimeSchemaState<NonNullable<Value>, Type, Options, Descriptor> {
  return {
    type: state.type,
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
  Type extends string,
  Options extends RuntimeSchemaOptions,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<Type, Options>,
>(state: RuntimeSchemaState<Value, Type, Options, Descriptor>): Descriptor {
  const base = {
    type: state.type,
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
