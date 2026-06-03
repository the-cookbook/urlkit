import type {
  BuildSearchOptions,
  PatchSearchOptions,
  UnknownSearchBehavior,
  UnknownSearchParams,
} from '../contracts.js';
import type { InferRuntimeSchemaValue, RuntimeSchemaBuilder } from '../schema/contracts.js';
import type { CompiledRuntimeSchema } from '../schema/compile-runtime-schema-value.js';

export type AnyRuntimeSchemaBuilder = RuntimeSchemaBuilder<any, any, any, any>;

export type RawSearchValue = string | readonly string[];

export type RawSearchParams = Readonly<Record<string, RawSearchValue>>;

export type SearchFieldType = 'one' | 'many';

export interface RuntimeSearchField<
  Schema extends AnyRuntimeSchemaBuilder = AnyRuntimeSchemaBuilder,
> {
  readonly type?: SearchFieldType;
  readonly value: Schema;
  readonly optional?: boolean;
  readonly default?: unknown;
}

export type RuntimeSearchFieldInput = AnyRuntimeSchemaBuilder | RuntimeSearchField;

export type RuntimeSearchSchema = Readonly<Record<string, RuntimeSearchFieldInput>>;

export interface ParseSearchOptions<SearchDescriptor = unknown> {
  readonly schema?: SearchDescriptor;
  readonly unknownSearch?: UnknownSearchBehavior;
}

export interface SearchBuildOptions<SearchDescriptor = unknown> extends BuildSearchOptions {
  readonly schema?: SearchDescriptor;
}

export interface SearchPatchOptions<SearchDescriptor = unknown> extends PatchSearchOptions {
  readonly schema?: SearchDescriptor;
}

export interface SearchParseResult<Search> {
  readonly search: Search;
  readonly unknownSearch?: UnknownSearchParams;
}

export interface CompiledSearchField {
  readonly key: string;
  readonly type: SearchFieldType;
  readonly schema: AnyRuntimeSchemaBuilder;
  readonly compiledSchema: CompiledRuntimeSchema;
  readonly presence: 'required' | 'optional' | 'defaulted';
  readonly defaultValue?: unknown;
}

export interface CompiledSearchSchema {
  readonly fields: readonly CompiledSearchField[];
  readonly keys: ReadonlySet<string>;
}

export interface SearchBuildContext {
  readonly options?: SearchBuildOptions;
}

export interface SearchPatchContext {
  readonly options?: PatchSearchOptions;
}

export type InferRuntimeSearch<Schema extends RuntimeSearchSchema> = Simplify<
  {
    readonly [Key in keyof Schema as IsOptionalSearchField<Schema[Key]> extends true
      ? never
      : Key]: InferSearchFieldValue<Schema[Key]>;
  } & {
    readonly [Key in keyof Schema as IsOptionalSearchField<Schema[Key]> extends true
      ? Key
      : never]?: Exclude<InferSearchFieldValue<Schema[Key]>, undefined>;
  }
>;

type InferSearchFieldValue<Field> =
  Field extends RuntimeSearchField<infer Schema>
    ? Field['type'] extends 'many'
      ? readonly InferSearchElementValue<Schema>[]
      : InferRuntimeSchemaValue<Schema>
    : Field extends AnyRuntimeSchemaBuilder
      ? InferRuntimeSchemaValue<Field>
      : never;

type InferSearchElementValue<Schema extends AnyRuntimeSchemaBuilder> = Exclude<
  InferRuntimeSchemaValue<Schema>,
  undefined
>;

type IsOptionalSearchField<Field> =
  Field extends RuntimeSearchField<infer Schema>
    ? 'default' extends keyof Field
      ? false
      : Field['optional'] extends true
        ? true
        : Field['type'] extends 'many'
          ? false
          : IsOptionalSchema<Schema>
    : Field extends AnyRuntimeSchemaBuilder
      ? IsOptionalSchema<Field>
      : false;

type IsOptionalSchema<Schema extends AnyRuntimeSchemaBuilder> =
  undefined extends InferRuntimeSchemaValue<Schema> ? true : false;

type Simplify<Value> = { readonly [Key in keyof Value]: Value[Key] } & {};
