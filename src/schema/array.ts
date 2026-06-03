import { UrlKitError } from '../errors/url-kit-error.js';
import type {
  AnyRuntimeSchemaBuilder,
  InferRuntimeSchemaValue,
  NormalizedRuntimeSchemaDescriptor,
  RequiredRuntimeSchemaDescriptor,
  RuntimeDefaultValidationContext,
  RuntimeSchemaCodec,
  RuntimeSchemaOptions,
  RuntimeSchemaBuilder,
  RuntimeSchemaValueContext,
} from './contracts.js';
import {
  runtimeSchemaSymbol,
  type RuntimeSchemaBuilderWithInternals,
} from './runtime-schema-symbol.js';
import { compileRuntimeSchema } from './compile-runtime-schema.js';
import { getRuntimeSchemaInternals } from './get-runtime-schema-internals.js';
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';
import { createSchemaValueError } from './create-schema-value-error.js';
import { normalizeRuntimeSchemaValue } from './normalize-runtime-schema-value.js';
import { parseRuntimeSchemaValue } from './parse-runtime-schema-value.js';
import { serializeRuntimeSchemaValue } from './serialize-runtime-schema-value.js';

export interface ArraySchemaOptions<
  ElementDescriptor extends NormalizedRuntimeSchemaDescriptor = NormalizedRuntimeSchemaDescriptor,
> extends RuntimeSchemaOptions {
  readonly element: ElementDescriptor;
}

export interface ArraySchema<Schema extends AnyRuntimeSchemaBuilder> extends RuntimeSchemaBuilder<
  readonly Exclude<InferRuntimeSchemaValue<Schema>, undefined>[],
  'array',
  ArraySchemaOptions,
  RequiredRuntimeSchemaDescriptor<'array', ArraySchemaOptions>
> {}

const arrayElements = new WeakMap<AnyRuntimeSchemaBuilder, AnyRuntimeSchemaBuilder>();

export function array<Schema extends AnyRuntimeSchemaBuilder>(
  element: Schema,
): ArraySchema<Schema> {
  const elementDescriptor = createElementDescriptor(element);

  const builder = createRuntimeSchemaBuilder<
    readonly Exclude<InferRuntimeSchemaValue<Schema>, undefined>[],
    'array',
    ArraySchemaOptions
  >({
    kind: 'array',
    options: {
      element: elementDescriptor,
    },
    codec: createArrayCodec(element) as RuntimeSchemaCodec<
      readonly Exclude<InferRuntimeSchemaValue<Schema>, undefined>[]
    >,
    validateDescriptor(context) {
      compileRuntimeSchema(element, { path: [...context.path, '*'] });
    },
    validateDefault(value, context) {
      validateArrayDefault(element, value, context);
    },
  });

  return withArrayElement(builder, element);
}

export function parseArrayRuntimeSchemaValue<Schema extends AnyRuntimeSchemaBuilder>(
  schema: ArraySchema<Schema>,
  input: string | readonly string[],
  context: RuntimeSchemaValueContext,
): readonly Exclude<InferRuntimeSchemaValue<Schema>, undefined>[] {
  const values = Array.isArray(input) ? input : [input];
  const element = getArrayElementSchema(schema);

  return Object.freeze(
    values.map(
      (value) =>
        parseRuntimeSchemaValue(element, value, {
          path: context.path,
          errorCode: context.errorCode,
          missingCode: context.errorCode,
        }) as Exclude<InferRuntimeSchemaValue<Schema>, undefined>,
    ),
  );
}

export function serializeArrayRuntimeSchemaValue<Schema extends AnyRuntimeSchemaBuilder>(
  schema: ArraySchema<Schema>,
  input: unknown,
  context: RuntimeSchemaValueContext,
): readonly string[] | undefined {
  const normalized = normalizeRuntimeSchemaValue(schema, input, {
    path: context.path,
    errorCode: context.errorCode,
    missingCode: context.errorCode,
  });

  if (!normalized.length) {
    return undefined;
  }

  const element = getArrayElementSchema(schema);

  return Object.freeze(
    normalized.map(
      (value) =>
        serializeRuntimeSchemaValue(element, value, {
          path: context.path,
          errorCode: context.errorCode,
          missingCode: context.errorCode,
        }) ?? '',
    ),
  );
}

function withArrayElement<Schema extends AnyRuntimeSchemaBuilder>(
  builder: AnyRuntimeSchemaBuilder,
  element: Schema,
): ArraySchema<Schema> {
  const wrapped = {
    [runtimeSchemaSymbol]: (builder as RuntimeSchemaBuilderWithInternals<any, any, any, any>)[
      runtimeSchemaSymbol
    ],

    optional: () => withArrayElement(builder.optional(), element),

    required: () => withArrayElement(builder.required(), element),

    default: (value: readonly Exclude<InferRuntimeSchemaValue<Schema>, undefined>[]) =>
      withArrayElement(builder.default(value), element),
  } as unknown as ArraySchema<Schema>;

  arrayElements.set(wrapped, element);

  return Object.freeze(wrapped);
}

function createArrayCodec<Schema extends AnyRuntimeSchemaBuilder>(
  schema: Schema,
): RuntimeSchemaCodec<readonly unknown[]> {
  return {
    parse(input, context) {
      return Object.freeze([
        parseRuntimeSchemaValue(schema, input, {
          path: context.path,
          errorCode: context.errorCode,
          missingCode: context.errorCode,
        }),
      ]);
    },

    normalize(input, context) {
      if (!Array.isArray(input)) {
        throw createSchemaValueError(context.errorCode, 'Expected an array value.', context.path);
      }

      return Object.freeze(
        input.map((item) =>
          normalizeRuntimeSchemaValue(schema, item, {
            path: context.path,
            errorCode: context.errorCode,
            missingCode: context.errorCode,
          }),
        ),
      );
    },

    serialize() {
      throw new UrlKitError(
        'invalid-descriptor',
        'Array schemas require repeated-key search serialization.',
      );
    },
  };
}

function validateArrayDefault<Schema extends AnyRuntimeSchemaBuilder>(
  schema: Schema,
  value: readonly unknown[],
  context: RuntimeDefaultValidationContext,
): void {
  if (!Array.isArray(value)) {
    throw new UrlKitError('invalid-descriptor', 'Array schema default must be an array.', {
      path: context.path,
    });
  }

  for (const item of value) {
    normalizeRuntimeSchemaValue(schema, item, {
      path: context.path,
      errorCode: 'invalid-descriptor',
      missingCode: 'invalid-descriptor',
    });
  }
}

function createElementDescriptor(
  schema: AnyRuntimeSchemaBuilder,
): NormalizedRuntimeSchemaDescriptor {
  return getRuntimeSchemaInternals(schema).toDescriptor();
}

function getArrayElementSchema<Schema extends AnyRuntimeSchemaBuilder>(
  schema: ArraySchema<Schema>,
): Schema {
  const element = arrayElements.get(schema);

  if (element) {
    return element as Schema;
  }

  throw new UrlKitError('invalid-descriptor', 'Array schema element is missing.');
}
