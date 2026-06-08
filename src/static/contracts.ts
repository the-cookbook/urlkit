import type { PathConstraintMap } from '../contracts.js';

export interface CompileStaticUrlOptions {
  readonly pathConstraints?: PathConstraintMap;
}

export interface StaticUrlDescriptor {
  readonly path?: string;
  readonly search?: StaticSearchDescriptor;
  readonly hash?: StaticHashDescriptor;
}

export type StaticUrlModeFromDescriptor<Descriptor extends StaticUrlDescriptor> =
  Descriptor extends { readonly path: string } ? 'path' : 'pathless';

export type InferStaticUrlSearch<Descriptor extends StaticUrlDescriptor> = Descriptor extends {
  readonly search: infer SearchDescriptor extends StaticSearchDescriptor;
}
  ? InferStaticSearch<SearchDescriptor>
  : {};

export type InferStaticUrlSearchBuildInput<Descriptor extends StaticUrlDescriptor> =
  Descriptor extends {
    readonly search: infer SearchDescriptor extends StaticSearchDescriptor;
  }
    ? InferStaticSearchBuildInput<SearchDescriptor>
    : {};

export type InferStaticUrlHash<Descriptor extends StaticUrlDescriptor> = Descriptor extends {
  readonly hash: infer HashDescriptor extends StaticHashDescriptor;
}
  ? InferStaticHash<HashDescriptor>
  : undefined;

export type InferStaticUrlHashBuildInput<Descriptor extends StaticUrlDescriptor> =
  Descriptor extends {
    readonly hash: infer HashDescriptor extends StaticHashDescriptor;
  }
    ? InferStaticHashBuildInput<HashDescriptor>
    : undefined;

export type StaticSearchDescriptor = Record<string, StaticSearchFieldInput>;

export interface StaticSearchFieldCommon {
  readonly many?: true;
}

export interface StaticSearchRequiredPresence {
  readonly optional?: never;
  readonly default?: never;
}

export interface StaticSearchOptionalPresence {
  readonly optional: true;
  readonly default?: never;
}

export interface StaticSearchDefaultPresence {
  readonly optional?: never;
  readonly default: unknown;
}

export type StaticSearchPresence =
  | StaticSearchRequiredPresence
  | StaticSearchOptionalPresence
  | StaticSearchDefaultPresence;

export interface StaticStringSearchFieldDescriptor extends StaticSearchFieldCommon {
  readonly type: 'string';
}

export interface StaticNumberSearchFieldDescriptor extends StaticSearchFieldCommon {
  readonly type: 'number';
}

export interface StaticIntSearchFieldDescriptor extends StaticSearchFieldCommon {
  readonly type: 'int';
}

export interface StaticBooleanSearchFieldDescriptor extends StaticSearchFieldCommon {
  readonly type: 'boolean';
}

export interface StaticDateSearchFieldDescriptor extends StaticSearchFieldCommon {
  readonly type: 'date';
  readonly format?: StaticDateFormat;
}

export interface StaticDateTimeSearchFieldDescriptor extends StaticSearchFieldCommon {
  readonly type: 'date-time';
  readonly format?: StaticDateTimeFormat;
}

export interface StaticEnumSearchFieldDescriptor extends StaticSearchFieldCommon {
  readonly type: 'enum';
  readonly values: readonly string[];
}

export type StaticSearchFieldDescriptor =
  | StaticStringSearchFieldDescriptor
  | StaticNumberSearchFieldDescriptor
  | StaticIntSearchFieldDescriptor
  | StaticBooleanSearchFieldDescriptor
  | StaticDateSearchFieldDescriptor
  | StaticDateTimeSearchFieldDescriptor
  | StaticEnumSearchFieldDescriptor;

export type StaticSearchField = StaticSearchFieldDescriptor & StaticSearchPresence;

export type StaticSearchValueField = StaticSearchFieldCommon &
  StaticSearchPresence & {
    readonly value: StaticSearchValue;
    readonly type?: never;
  };

export type StaticSearchFieldInput = StaticSearchValue | StaticSearchField | StaticSearchValueField;

export type StaticPrimitiveSearchValue = 'string' | 'number' | 'int' | 'boolean';

export type BuiltInStaticDateFormat = 'date' | 'date-time' | 'unix-seconds' | 'unix-ms';
export type StaticDateFormat = BuiltInStaticDateFormat | string;
export type StaticDateTimeFormat = 'date-time' | string;

export interface StaticDateSearchValue {
  readonly type: 'date';
  readonly format?: StaticDateFormat;
}

export interface StaticDateTimeSearchValue {
  readonly type: 'date-time';
  readonly format?: StaticDateTimeFormat;
}

export interface StaticEnumSearchValue {
  readonly type: 'enum';
  readonly values: readonly string[];
}

export type StaticSearchValue =
  | StaticPrimitiveSearchValue
  | StaticDateSearchValue
  | StaticDateTimeSearchValue
  | StaticEnumSearchValue;

export type InferStaticSearch<Descriptor extends StaticSearchDescriptor> = Simplify<
  {
    readonly [Key in keyof Descriptor as IsOptionalStaticSearchField<Descriptor[Key]> extends true
      ? never
      : Key]: InferStaticSearchFieldValue<Descriptor[Key]>;
  } & {
    readonly [Key in keyof Descriptor as IsOptionalStaticSearchField<Descriptor[Key]> extends true
      ? Key
      : never]?: InferStaticSearchFieldValue<Descriptor[Key]>;
  }
>;

export type InferStaticSearchBuildInput<Descriptor extends StaticSearchDescriptor> = Simplify<
  {
    readonly [Key in keyof Descriptor as IsRequiredStaticSearchBuildField<
      Descriptor[Key]
    > extends true
      ? Key
      : never]: InferStaticSearchFieldValue<Descriptor[Key]>;
  } & {
    readonly [Key in keyof Descriptor as IsRequiredStaticSearchBuildField<
      Descriptor[Key]
    > extends true
      ? never
      : Key]?: InferStaticSearchFieldValue<Descriptor[Key]>;
  }
>;

export interface StaticHashRequiredPresence {
  readonly optional?: never;
  readonly default?: never;
}

export interface StaticHashOptionalPresence {
  readonly optional: true;
  readonly default?: never;
}

export interface StaticHashDefaultPresence {
  readonly optional?: never;
  readonly default: string;
}

export type StaticHashPresence =
  | StaticHashRequiredPresence
  | StaticHashOptionalPresence
  | StaticHashDefaultPresence;

export interface StaticStringHashDescriptorBase {
  readonly type: 'string';
}

export interface StaticEnumHashDescriptorBase {
  readonly type: 'enum';
  readonly values: readonly string[];
}

export type StaticStringHashDescriptor = StaticStringHashDescriptorBase & StaticHashPresence;

export type StaticEnumHashDescriptor = StaticEnumHashDescriptorBase & StaticHashPresence;

export type StaticHashDescriptor = StaticStringHashDescriptor | StaticEnumHashDescriptor;

export type InferStaticHash<Descriptor extends StaticHashDescriptor> =
  Descriptor extends StaticStringHashDescriptor
    ? InferStaticStringHash<Descriptor>
    : Descriptor extends StaticEnumHashDescriptor
      ? InferStaticEnumHash<Descriptor>
      : never;

type InferStaticStringHash<Descriptor extends StaticStringHashDescriptor> =
  'default' extends keyof Descriptor
    ? string
    : Descriptor['optional'] extends true
      ? string | undefined
      : string;

type InferStaticEnumHash<Descriptor extends StaticEnumHashDescriptor> =
  'default' extends keyof Descriptor
    ? Descriptor['values'][number]
    : Descriptor['optional'] extends true
      ? Descriptor['values'][number] | undefined
      : Descriptor['values'][number];

export type InferStaticHashBuildInput<Descriptor extends StaticHashDescriptor> =
  Descriptor extends StaticStringHashDescriptor
    ? InferStaticStringHashBuildInput<Descriptor>
    : Descriptor extends StaticEnumHashDescriptor
      ? InferStaticEnumHashBuildInput<Descriptor>
      : never;

type InferStaticStringHashBuildInput<Descriptor extends StaticStringHashDescriptor> =
  'default' extends keyof Descriptor
    ? string | undefined
    : Descriptor['optional'] extends true
      ? string | undefined
      : string;

type InferStaticEnumHashBuildInput<Descriptor extends StaticEnumHashDescriptor> =
  'default' extends keyof Descriptor
    ? Descriptor['values'][number] | undefined
    : Descriptor['optional'] extends true
      ? Descriptor['values'][number] | undefined
      : Descriptor['values'][number];

type InferStaticSearchFieldValue<Field extends StaticSearchFieldInput> = Field extends {
  readonly many: true;
}
  ? readonly InferStaticSearchValue<StaticSearchFieldValueDescriptor<Field>>[]
  : InferStaticSearchValue<StaticSearchFieldValueDescriptor<Field>>;

type StaticSearchFieldValueDescriptor<Field> = Field extends { readonly value: infer Value }
  ? Value
  : Field;

type InferStaticSearchValue<Value> = Value extends 'string'
  ? string
  : Value extends 'number'
    ? number
    : Value extends 'int'
      ? number
      : Value extends 'boolean'
        ? boolean
        : Value extends { readonly type: 'string' }
          ? string
          : Value extends { readonly type: 'number' }
            ? number
            : Value extends { readonly type: 'int' }
              ? number
              : Value extends { readonly type: 'boolean' }
                ? boolean
                : Value extends StaticDateSearchValue | StaticDateTimeSearchValue
                  ? Date
                  : Value extends StaticEnumSearchValue
                    ? Value['values'][number]
                    : never;

type IsOptionalStaticSearchField<Field extends StaticSearchFieldInput> =
  'default' extends keyof Field ? false : Field extends { readonly optional: true } ? true : false;

type IsRequiredStaticSearchBuildField<Field extends StaticSearchFieldInput> =
  'default' extends keyof Field ? false : Field extends { readonly optional: true } ? false : true;

type Simplify<Value> = { readonly [Key in keyof Value]: Value[Key] } & {};
