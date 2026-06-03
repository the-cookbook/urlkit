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

export type StaticSearchDescriptor = Readonly<Record<string, StaticSearchField>>;

export type StaticSearchField = StaticSearchValue | StaticSearchFieldObject;

export interface StaticSearchFieldObject {
  readonly type?: 'one' | 'many';
  readonly optional?: boolean;
  readonly value?: StaticSearchValue;
  readonly default?: unknown;
}

export type StaticSearchValue =
  | 'string'
  | 'number'
  | 'int'
  | 'boolean'
  | 'date'
  | 'date-time'
  | 'unix-seconds'
  | 'unix-ms'
  | StaticDateSearchValue
  | StaticEnumSearchValue;

export interface StaticDateSearchValue {
  readonly type: 'date';
  readonly format?: StaticDateFormat;
}

export type StaticDateFormat = 'date' | 'date-time' | 'unix-seconds' | 'unix-ms';

export interface StaticEnumSearchValue {
  readonly type: 'enum';
  readonly values: readonly string[];
}

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

export type StaticHashDescriptor =
  | readonly string[]
  | StaticStringHashDescriptor
  | StaticEnumHashDescriptor;

export interface StaticStringHashDescriptor {
  readonly type: 'string';
  readonly optional?: boolean;
  readonly default?: string;
}

export interface StaticEnumHashDescriptor {
  readonly type: 'enum';
  readonly values: readonly string[];
  readonly optional?: boolean;
  readonly default?: string;
}

export type InferStaticHash<Descriptor extends StaticHashDescriptor> =
  Descriptor extends readonly string[]
    ? Descriptor[number] | undefined
    : Descriptor extends StaticStringHashDescriptor
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
  Descriptor extends readonly string[]
    ? Descriptor[number] | undefined
    : Descriptor extends StaticStringHashDescriptor
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

type InferStaticSearchFieldValue<Field> = Field extends StaticSearchFieldObject
  ? Field['type'] extends 'many'
    ? readonly InferStaticSearchValue<StaticFieldObjectValue<Field>>[]
    : InferStaticSearchValue<StaticFieldObjectValue<Field>>
  : InferStaticSearchValue<Field>;

type StaticFieldObjectValue<Field extends StaticSearchFieldObject> = Field extends {
  readonly value: infer Value;
}
  ? Value
  : 'string';

type InferStaticSearchValue<Value> = Value extends 'string'
  ? string
  : Value extends 'number'
    ? number
    : Value extends 'int'
      ? number
      : Value extends 'boolean'
        ? boolean
        : Value extends 'date' | 'date-time' | 'unix-seconds' | 'unix-ms'
          ? Date
          : Value extends StaticDateSearchValue
            ? Date
            : Value extends StaticEnumSearchValue
              ? Value['values'][number]
              : never;

type IsOptionalStaticSearchField<Field> = Field extends StaticSearchFieldObject
  ? 'default' extends keyof Field
    ? false
    : Field['optional'] extends true
      ? true
      : false
  : false;

type IsRequiredStaticSearchBuildField<Field> = Field extends StaticSearchFieldObject
  ? 'default' extends keyof Field
    ? false
    : Field['optional'] extends true
      ? false
      : true
  : true;

type Simplify<Value> = { readonly [Key in keyof Value]: Value[Key] } & {};
