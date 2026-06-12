import type {
  BuildHashArguments,
  BuildSearchOptions,
  BuildUrlOptions,
  EmptyParams,
  NormalizeUrlOptions,
  NormalizeUrlState,
  ParseRequestOptions,
  ParseUrlOptions,
  PatchSearchOptions,
  PathBuildMethod,
  PathConstraintMap,
  SearchInputArgument,
  UrlBuildInput,
  UrlMode,
  UrlNormalizeInput,
  UrlRequestInput,
  UrlSafeNormalizeResult,
  UrlSafeParseResult,
  UrlState,
  SearchArrayFormat,
  UnknownSearchBehavior,
  UrlPathMatchOptions,
} from '../contracts.js';
import type { HashSchema, NormalizedHashDescriptor } from '../hash/contracts.js';
import type {
  InferRuntimeSearch,
  InferRuntimeSearchBuildInput,
  RuntimeSearchSchema,
} from '../search/contracts.js';
import type { InferRuntimeSchemaDescriptor, InferRuntimeSchemaValue } from '../schema/contracts.js';

export interface NormalizedUrlDescriptor<Mode extends UrlMode = UrlMode> {
  readonly mode: Mode;
  readonly pattern: Mode extends 'path' ? string : undefined;
  readonly path?: Mode extends 'path' ? CompiledPath : undefined;
  readonly search?: RuntimeSearchSchema;
  readonly hash?: NormalizedHashDescriptor;
}

export interface RuntimeUrlDescriptor {
  readonly path?: string;
  readonly search?: RuntimeSearchSchema;
  readonly hash?: HashSchema;
}

export interface CreateUrlOptions {
  readonly unknownSearch?: UnknownSearchBehavior;
  readonly arrayFormat?: SearchArrayFormat;
  readonly pathConstraints?: PathConstraintMap;
  readonly pathMatch?: UrlPathMatchOptions;
}

export interface CreateUrlContractOptions extends CreateUrlOptions {}

export interface UrlContract<
  Mode extends UrlMode,
  Pathname,
  Params,
  Search,
  Hash,
  SearchInput = Partial<Search>,
  HashInput = Hash,
> {
  readonly pattern: Mode extends 'path' ? string : undefined;

  parse(input: string | URL, options?: ParseUrlOptions): UrlState<Pathname, Params, Search, Hash>;

  safeParse(
    input: string | URL,
    options?: ParseUrlOptions,
  ): UrlSafeParseResult<Pathname, Params, Search, Hash>;

  parseRequest(
    input: Request | UrlRequestInput,
    options?: ParseRequestOptions,
  ): UrlState<Pathname, Params, Search, Hash>;

  safeParseRequest(
    input: Request | UrlRequestInput,
    options?: ParseRequestOptions,
  ): UrlSafeParseResult<Pathname, Params, Search, Hash>;

  normalize<
    const Input extends UrlNormalizeInput<Mode, Params, Search, Hash, SearchInput, HashInput>,
  >(
    input: Input & UrlNormalizeInput<Mode, Params, Search, Hash, SearchInput, HashInput>,
    options?: NormalizeUrlOptions,
  ): NormalizeUrlState<Mode, Pathname, Params, Search, Hash, Input>;

  safeNormalize<
    const Input extends UrlNormalizeInput<Mode, Params, Search, Hash, SearchInput, HashInput>,
  >(
    input: Input & UrlNormalizeInput<Mode, Params, Search, Hash, SearchInput, HashInput>,
    options?: NormalizeUrlOptions,
  ): UrlSafeNormalizeResult<Mode, Pathname, Params, Search, Hash, Input>;

  build(
    input:
      | UrlBuildInput<Mode, Params, Search, Hash, SearchInput, HashInput>
      | UrlState<Pathname, Params, Search, Hash>,
    options?: BuildUrlOptions,
  ): string;

  match(input: string | URL, options?: ParseUrlOptions): boolean;

  readonly parsePathname: Mode extends 'path'
    ? (pathname: string, options?: UrlPathMatchOptions) => Params
    : never;

  readonly buildPath: Mode extends 'path' ? PathBuildMethod<Params> : never;

  parseSearch(input: string | URLSearchParams, options?: ParseUrlOptions): Search;

  parseHash(input: unknown): Hash;

  buildSearch(search: SearchInputArgument<SearchInput>, options?: BuildSearchOptions): string;

  buildHash(...args: BuildHashArguments<HashInput>): string;

  withSearch(input: string | URL, search: Partial<Search>, options?: PatchSearchOptions): string;

  replaceSearch(input: string | URL, search: SearchInput, options?: BuildSearchOptions): string;

  omitSearch(input: string | URL, keys: readonly string[], options?: BuildSearchOptions): string;

  pickSearch(input: string | URL, keys: readonly string[], options?: BuildSearchOptions): string;
}

export interface CompilePathOptions {
  readonly params?: 'raw' | 'parsed';
  readonly pathConstraints?: PathConstraintMap;
  readonly pathMatch?: UrlPathMatchOptions;
}

export interface PathMatchSuccess<Params> {
  readonly match: true;
  readonly path: string;
  readonly params: Params;
}

export interface PathMatchFailure {
  readonly match: false;
  readonly params: null;
}

export type PathMatchResult<Params> = PathMatchSuccess<Params> | PathMatchFailure;

export interface CompiledPath<
  Pattern extends string = string,
  Params = ParamsFromPattern<Pattern>,
> {
  readonly pattern: Pattern;
  parsePathname(pathname: string, options?: UrlPathMatchOptions): Params;
  matchPathname(pathname: string, options?: UrlPathMatchOptions): PathMatchResult<Params>;
  buildPath: PathBuildMethod<Params>;
}

export type UrlModeFromRuntimeDescriptor<Descriptor> = Descriptor extends { readonly path: string }
  ? 'path'
  : 'pathless';

export type PathnameFromRuntimeDescriptor<Descriptor> = Descriptor extends {
  readonly path: infer Pattern extends string;
}
  ? PathnameFromPattern<Pattern>
  : string;

export type ParamsFromRuntimeDescriptor<Descriptor> = Descriptor extends {
  readonly path: infer Pattern extends string;
}
  ? ParamsFromPattern<Pattern>
  : EmptyParams;

export type SearchFromRuntimeDescriptor<Descriptor> = Descriptor extends {
  readonly search: infer Search extends RuntimeSearchSchema;
}
  ? InferRuntimeSearch<Search>
  : EmptyParams;

export type SearchBuildInputFromRuntimeDescriptor<Descriptor> = Descriptor extends {
  readonly search: infer Search extends RuntimeSearchSchema;
}
  ? InferRuntimeSearchBuildInput<Search>
  : EmptyParams;

export type HashFromRuntimeDescriptor<Descriptor> = Descriptor extends {
  readonly hash: infer Schema;
}
  ? Schema extends HashSchema
    ? InferRuntimeSchemaValue<Schema>
    : never
  : undefined;

export type HashBuildInputFromRuntimeDescriptor<Descriptor> = Descriptor extends {
  readonly hash: infer Schema;
}
  ? Schema extends HashSchema
    ? HashBuildInputFromRuntimeSchema<Schema>
    : never
  : undefined;

export type HashBuildInputFromRuntimeSchema<Schema extends HashSchema> =
  InferRuntimeSchemaDescriptor<Schema> extends { readonly presence: 'required' }
    ? InferRuntimeSchemaValue<Schema>
    : InferRuntimeSchemaValue<Schema> | undefined;

export type RawParamsFromPattern<Pattern extends string> = Simplify<ExtractRawPathParams<Pattern>>;

type ExtractRawPathParams<Pattern extends string> =
  Pattern extends `${string}{${infer Token}}${infer Rest}`
    ? RawParamFromToken<Token> & ExtractRawPathParams<Rest>
    : {};

type RawParamFromToken<Token extends string> =
  IsOptionalPathParamToken<Token> extends true
    ? Readonly<Partial<Record<PathParamNameFromToken<Token>, string>>>
    : Readonly<Record<PathParamNameFromToken<Token>, string>>;

export type PathnameFromPattern<Pattern extends string> =
  Pattern extends `${infer Before}{${infer Param}}${infer After}`
    ? IsOptionalPathParamToken<Param> extends true
      ?
          | `${TrimTrailingSlash<Before>}${PathnameFromPattern<After>}`
          | `${Before}${PathParamValue<Param>}${PathnameFromPattern<After>}`
      : `${Before}${PathParamValue<Param>}${PathnameFromPattern<After>}`
    : Pattern;

export type ParamsFromPattern<Pattern extends string> = Simplify<ExtractPathParams<Pattern>>;

type ExtractPathParams<Pattern extends string> =
  Pattern extends `${string}{${infer Token}}${infer Rest}`
    ? ParamFromToken<Token> & ExtractPathParams<Rest>
    : {};

type ParamFromToken<Token extends string> =
  IsOptionalPathParamToken<Token> extends true
    ? Readonly<Partial<Record<PathParamNameFromToken<Token>, PathParamValue<Token>>>>
    : Readonly<Record<PathParamNameFromToken<Token>, PathParamValue<Token>>>;

type StripWildcardPathParam<Token extends string> = Token extends `*${infer Name}` ? Name : Token;

type StripOptionalPathParam<Token extends string> = Token extends `${infer Value}?` ? Value : Token;

type NormalizedPathParamToken<Token extends string> = StripOptionalPathParam<
  StripWildcardPathParam<Token>
>;

type IsOptionalPathParamToken<Token extends string> =
  StripWildcardPathParam<Token> extends `${string}?` ? true : false;

type PathParamNameFromToken<Token extends string> =
  NormalizedPathParamToken<Token> extends `${infer Name}:${string}`
    ? CleanPathParamName<Name>
    : CleanPathParamName<NormalizedPathParamToken<Token>>;

type ConstraintChainFromToken<Token extends string> =
  NormalizedPathParamToken<Token> extends `${string}:${infer ConstraintChain}`
    ? ConstraintChain
    : '';

type CleanPathParamName<Name extends string> = Name extends `${infer Clean}?` ? Clean : Name;

type PathParamValue<Param extends string> = PathParamValueFromConstraintChain<
  ConstraintChainFromToken<Param>
>;

type PathParamValueFromConstraintChain<ConstraintChain extends string> =
  ConstraintChainHasNumberProducer<ConstraintChain> extends true ? number : string;

type ConstraintChainHasNumberProducer<ConstraintChain extends string> =
  ConstraintChainHasExact<ConstraintChain, 'int'> extends true
    ? true
    : ConstraintChainHasExact<ConstraintChain, 'decimal'> extends true
      ? true
      : ConstraintChainHasParameterized<ConstraintChain, 'range'> extends true
        ? true
        : ConstraintChainHasParameterized<ConstraintChain, 'min'> extends true
          ? true
          : ConstraintChainHasParameterized<ConstraintChain, 'max'> extends true
            ? true
            : false;

type ConstraintChainHasExact<
  ConstraintChain extends string,
  Name extends string,
> = ConstraintChain extends Name
  ? true
  : ConstraintChain extends `${Name}:${string}`
    ? true
    : ConstraintChain extends `${string}:${Name}`
      ? true
      : ConstraintChain extends `${string}:${Name}:${string}`
        ? true
        : false;

type ConstraintChainHasParameterized<
  ConstraintChain extends string,
  Name extends string,
> = ConstraintChain extends `${Name}(${string})`
  ? true
  : ConstraintChain extends `${Name}(${string}):${string}`
    ? true
    : ConstraintChain extends `${string}:${Name}(${string})`
      ? true
      : ConstraintChain extends `${string}:${Name}(${string}):${string}`
        ? true
        : false;

type TrimTrailingSlash<Value extends string> = Value extends `${infer Prefix}/` ? Prefix : Value;

type Simplify<Value> = { readonly [Key in keyof Value]: Value[Key] } & {};
