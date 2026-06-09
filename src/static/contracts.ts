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

export type StaticSearchDescriptor = Record<string, StaticSearchField>;

export interface StaticSearchFieldBase {
  readonly many?: true;
  readonly optional?: true;
  readonly default?: unknown;
}

export interface StaticStringSearchField extends StaticSearchFieldBase {
  readonly type: 'string';
}

export interface StaticNumberSearchField extends StaticSearchFieldBase {
  readonly type: 'number';
}

export interface StaticIntSearchField extends StaticSearchFieldBase {
  readonly type: 'int';
}

export interface StaticBooleanSearchField extends StaticSearchFieldBase {
  readonly type: 'boolean';
}

export interface StaticDateSearchField extends StaticSearchFieldBase {
  readonly type: 'date';
  readonly format?: StaticDateFormat;
}

export interface StaticDateTimeSearchField extends StaticSearchFieldBase {
  readonly type: 'date-time';
  readonly format?: StaticDateTimeFormat;
}

export interface StaticEnumSearchField extends StaticSearchFieldBase {
  readonly type: 'enum';
  readonly values: readonly string[];
}

export type StaticSearchField =
  | StaticStringSearchField
  | StaticNumberSearchField
  | StaticIntSearchField
  | StaticBooleanSearchField
  | StaticDateSearchField
  | StaticDateTimeSearchField
  | StaticEnumSearchField;

export type BuiltInStaticDateFormat = 'date' | 'date-time' | 'unix-seconds' | 'unix-ms';
export type StaticDateFormat = BuiltInStaticDateFormat | string;
export type StaticDateTimeFormat = 'date-time' | string;

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

type InferStaticSearchFieldValue<Field extends StaticSearchField> = Field['many'] extends true
  ? readonly InferStaticSearchValue<Field>[]
  : InferStaticSearchValue<Field>;

type InferStaticSearchValue<Value> = Value extends { readonly type: 'string' }
  ? string
  : Value extends { readonly type: 'number' }
    ? number
    : Value extends { readonly type: 'int' }
      ? number
      : Value extends { readonly type: 'boolean' }
        ? boolean
        : Value extends StaticDateSearchField | StaticDateTimeSearchField
          ? Date
          : Value extends StaticEnumSearchField
            ? Value['values'][number]
            : never;

type IsOptionalStaticSearchField<Field extends StaticSearchField> = 'default' extends keyof Field
  ? false
  : Field['optional'] extends true
    ? true
    : false;

type IsRequiredStaticSearchBuildField<Field extends StaticSearchField> =
  'default' extends keyof Field ? false : Field['optional'] extends true ? false : true;

type Simplify<Value> = { readonly [Key in keyof Value]: Value[Key] } & {};
