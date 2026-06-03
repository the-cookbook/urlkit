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
import { createRuntimeSchemaBuilder } from './create-schema-builder.js';
import { createSchemaValueError } from './create-schema-value-error.js';
import { getRuntimeSchemaInternals } from './get-runtime-schema-internals.js';
import { normalizeRuntimeSchemaValue } from './normalize-runtime-schema-value.js';

export type ObjectSchemaShape = Readonly<Record<string, AnyRuntimeSchemaBuilder>>;

export interface ObjectSchemaOptions extends RuntimeSchemaOptions {
  readonly shape: Readonly<Record<string, NormalizedRuntimeSchemaDescriptor>>;
}

export interface ObjectSchema<
  Shape extends ObjectSchemaShape,
  Value = InferObjectShape<Shape>,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<'object', ObjectSchemaOptions> =
    RequiredRuntimeSchemaDescriptor<'object', ObjectSchemaOptions>,
> extends RuntimeSchemaBuilder<Value, 'object', ObjectSchemaOptions, Descriptor> {}

export type AnyObjectSchema = ObjectSchema<any, any, any>;

export type InferObjectShape<Shape extends ObjectSchemaShape> = Simplify<
  {
    readonly [Key in keyof Shape as IsOptionalObjectField<Shape[Key]> extends true
      ? never
      : Key]: InferRuntimeSchemaValue<Shape[Key]>;
  } & {
    readonly [Key in keyof Shape as IsOptionalObjectField<Shape[Key]> extends true
      ? Key
      : never]?: Exclude<InferRuntimeSchemaValue<Shape[Key]>, undefined>;
  }
>;

const objectShapes = new WeakMap<AnyRuntimeSchemaBuilder, ObjectSchemaShape>();

export function object<const Shape extends ObjectSchemaShape>(shape: Shape): ObjectSchema<Shape> {
  validateObjectShape(shape);

  const builder = createRuntimeSchemaBuilder<
    InferObjectShape<Shape>,
    'object',
    ObjectSchemaOptions
  >({
    kind: 'object',
    options: {
      shape: createShapeDescriptor(shape),
    },
    codec: createObjectCodec(shape),
    validateDescriptor(context) {
      validateObjectDescriptor(shape, context);
    },
    validateDefault(value, context) {
      validateObjectDefault(shape, value, context);
    },
  });

  return withObjectShape(builder, shape);
}

function withObjectShape<
  Shape extends ObjectSchemaShape,
  Value,
  Descriptor extends NormalizedRuntimeSchemaDescriptor<'object', ObjectSchemaOptions>,
>(
  builder: RuntimeSchemaBuilder<Value, 'object', ObjectSchemaOptions, Descriptor>,
  shape: Shape,
): ObjectSchema<Shape, Value, Descriptor> {
  const wrapped = {
    [runtimeSchemaSymbol]: (
      builder as RuntimeSchemaBuilderWithInternals<Value, 'object', ObjectSchemaOptions, Descriptor>
    )[runtimeSchemaSymbol],

    optional: () => withObjectShape(builder.optional(), shape),

    required: () => withObjectShape(builder.required(), shape),

    default: (value: NonNullable<Value>) => withObjectShape(builder.default(value), shape),
  } as unknown as ObjectSchema<Shape, Value, Descriptor>;

  objectShapes.set(wrapped, shape);

  return Object.freeze(wrapped);
}

export function getObjectSchemaShape<Shape extends ObjectSchemaShape>(
  schema: ObjectSchema<Shape, any, any>,
): Shape {
  const shape = objectShapes.get(schema);

  if (shape) {
    return shape as Shape;
  }

  throw new UrlKitError('invalid-descriptor', 'Object schema shape is missing.');
}

function createObjectCodec<Shape extends ObjectSchemaShape>(
  shape: Shape,
): RuntimeSchemaCodec<InferObjectShape<Shape>> {
  return {
    parse(_input, context) {
      throw createSchemaValueError(
        context.errorCode,
        'Object search values must use declared dotted keys.',
        context.path,
      );
    },

    normalize(input, context) {
      return normalizeObjectValue(shape, input, context) as InferObjectShape<Shape>;
    },

    serialize(_input, context) {
      throw createSchemaValueError(
        context.errorCode,
        'Object search values must use declared dotted keys.',
        context.path,
      );
    },
  };
}

function normalizeObjectValue(
  shape: ObjectSchemaShape,
  input: unknown,
  context: RuntimeSchemaValueContext,
): Readonly<Record<string, unknown>> {
  if (!isPlainObject(input)) {
    throw createSchemaValueError(context.errorCode, 'Expected an object value.', context.path);
  }

  const result: Record<string, unknown> = {};

  for (const [key, schema] of Object.entries(shape)) {
    const value = normalizeRuntimeSchemaValue(schema, input[key], {
      path: [...context.path, key],
      errorCode: context.errorCode,
      missingCode: context.errorCode,
    });

    if (value !== undefined) {
      result[key] = value;
    }
  }

  return Object.freeze(result);
}

function validateObjectDefault(
  shape: ObjectSchemaShape,
  value: InferObjectShape<ObjectSchemaShape>,
  context: RuntimeDefaultValidationContext,
): void {
  normalizeObjectValue(shape, value, {
    kind: 'object',
    path: context.path,
    errorCode: 'invalid-descriptor',
  });
}

function validateObjectDescriptor(
  shape: ObjectSchemaShape,
  context: RuntimeDefaultValidationContext,
): void {
  for (const [key, schema] of Object.entries(shape)) {
    compileRuntimeSchema(schema, { path: [...context.path, key] });
  }
}

function createShapeDescriptor(
  shape: ObjectSchemaShape,
): Readonly<Record<string, NormalizedRuntimeSchemaDescriptor>> {
  const descriptors: Record<string, NormalizedRuntimeSchemaDescriptor> = {};

  for (const [key, schema] of Object.entries(shape)) {
    descriptors[key] = getRuntimeSchemaInternals(schema).toDescriptor();
  }

  return Object.freeze(descriptors);
}

function validateObjectShape(shape: ObjectSchemaShape): void {
  if (!isPlainObject(shape)) {
    throw new UrlKitError('invalid-descriptor', 'Object schema shape must be an object.');
  }

  for (const [key, schema] of Object.entries(shape)) {
    if (!key) {
      throw new UrlKitError('invalid-descriptor', 'Object schema field names must not be empty.');
    }

    getRuntimeSchemaInternals(schema);
  }
}

function isPlainObject(input: unknown): input is Record<string, unknown> {
  return (
    typeof input === 'object' && input !== null && !Array.isArray(input) && !(input instanceof Date)
  );
}

type IsOptionalObjectField<Schema extends AnyRuntimeSchemaBuilder> =
  undefined extends InferRuntimeSchemaValue<Schema> ? true : false;

type Simplify<Value> = { readonly [Key in keyof Value]: Value[Key] } & {};
