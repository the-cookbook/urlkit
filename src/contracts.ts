import type { ConstraintValidation } from '@cookbook/pathkit';
import type { UrlKitError } from './errors/url-kit-error.js';

export type UrlMode = 'path' | 'pathless';

export type UnknownSearchBehavior = 'strip' | 'preserve' | 'error';

export type InvalidSearchBehavior = 'error' | 'omit';

export type InvalidHashBehavior = 'error' | 'omit';

export type SearchArrayFormat = 'repeat' | 'comma';

export type UrlPathWildcardFormat = 'string' | 'array';

export type DecodePathParam = (value: string) => string;

export interface UrlPathMatchOptions {
  readonly trailing?: boolean;
  readonly sensitive?: boolean;
  readonly strict?: boolean;
  readonly end?: boolean;
  readonly wildcardFormat?: UrlPathWildcardFormat;
  readonly decode?: boolean | DecodePathParam;
}

export type UnknownSearchParams = Readonly<Record<string, string | readonly string[]>>;

export type EmptyParams = Readonly<Record<never, never>>;

export type PathConstraintMap = Record<string, ConstraintValidation>;

export interface RegisterPathConstraintOptions {
  readonly overwrite?: boolean;
}

export interface UrlState<Pathname, Params, Search, Hash> {
  readonly pathname: Pathname;
  readonly params: Params;
  readonly search: Search;
  readonly hash: Hash;
  readonly unknownSearch?: UnknownSearchParams;
}

export interface UrlRequestInput {
  readonly url: string;
}

export interface ParseUrlOptions extends UrlPathMatchOptions {
  readonly unknownSearch?: UnknownSearchBehavior;
  readonly arrayFormat?: SearchArrayFormat;
  readonly invalidSearch?: InvalidSearchBehavior;
}

export interface NormalizeUrlOptions {
  readonly unknownSearch?: UnknownSearchBehavior;
}

export interface BuildUrlOptions {
  readonly defaults?: 'include' | 'omit';
  readonly arrayFormat?: SearchArrayFormat;
}

export interface BuildSearchOptions extends BuildUrlOptions {
  readonly sortKeys?: boolean;
}

export interface PatchSearchOptions extends BuildSearchOptions {
  readonly removeUndefined?: boolean;
  readonly removeNull?: boolean;
}

export interface ParseRequestOptions extends ParseUrlOptions {
  readonly baseUrl?: string;
}

export interface UrlSafeParseSuccess<Pathname, Params, Search, Hash> {
  readonly success: true;
  readonly data: UrlState<Pathname, Params, Search, Hash>;
}

export interface UrlSafeParseFailure<ErrorValue extends Error = UrlKitError> {
  readonly success: false;
  readonly error: ErrorValue;
}

export type UrlSafeParseResult<
  Pathname,
  Params,
  Search,
  Hash,
  ErrorValue extends Error = UrlKitError,
> = UrlSafeParseSuccess<Pathname, Params, Search, Hash> | UrlSafeParseFailure<ErrorValue>;

export interface UrlSafeNormalizeSuccess<
  Mode extends UrlMode,
  Pathname,
  Params,
  Search,
  Hash,
  Input,
> {
  readonly success: true;
  readonly data: NormalizeUrlState<Mode, Pathname, Params, Search, Hash, Input>;
}

export type UrlSafeNormalizeResult<
  Mode extends UrlMode,
  Pathname,
  Params,
  Search,
  Hash,
  Input,
  ErrorValue extends Error = UrlKitError,
> =
  | UrlSafeNormalizeSuccess<Mode, Pathname, Params, Search, Hash, Input>
  | UrlSafeParseFailure<ErrorValue>;

export type PathBasedBuildInputWithParams<
  Params,
  Search,
  Hash,
  SearchInput = Partial<Search>,
  HashInput = Hash,
> = {
  readonly pathname?: never;
  readonly params: Params;
} & SearchInputProperty<SearchInput> &
  HashInputProperty<HashInput>;

export type PathBasedBuildInputWithoutParams<
  Params,
  Search,
  Hash,
  SearchInput = Partial<Search>,
  HashInput = Hash,
> = {
  readonly pathname?: never;
  readonly params?: Params;
} & SearchInputProperty<SearchInput> &
  HashInputProperty<HashInput>;

export type PathBasedBuildInput<
  Params,
  Search,
  Hash,
  SearchInput = Partial<Search>,
  HashInput = Hash,
> =
  RequiredKeys<Params> extends never
    ? PathBasedBuildInputWithoutParams<Params, Search, Hash, SearchInput, HashInput>
    : PathBasedBuildInputWithParams<Params, Search, Hash, SearchInput, HashInput>;

export type PathlessBuildInput<Search, Hash, SearchInput = Partial<Search>, HashInput = Hash> = {
  readonly pathname?: string;
  readonly params?: never;
} & SearchInputProperty<SearchInput> &
  HashInputProperty<HashInput>;

export type UrlBuildInput<
  Mode extends UrlMode,
  Params,
  Search,
  Hash,
  SearchInput = Partial<Search>,
  HashInput = Hash,
> = Mode extends 'path'
  ? PathBasedBuildInput<Params, Search, Hash, SearchInput, HashInput>
  : PathlessBuildInput<Search, Hash, SearchInput, HashInput>;

export type PathBasedNormalizeInputWithParams<
  Params,
  Search,
  Hash,
  SearchInput = Partial<Search>,
  HashInput = Hash,
> = {
  readonly pathname?: never;
  readonly params: Params;
} & SearchInputProperty<SearchInput> &
  HashInputProperty<HashInput>;

export type PathBasedNormalizeInputWithoutParams<
  Params,
  Search,
  Hash,
  SearchInput = Partial<Search>,
  HashInput = Hash,
> = {
  readonly pathname?: never;
  readonly params?: Params;
} & SearchInputProperty<SearchInput> &
  HashInputProperty<HashInput>;

export type PathBasedNormalizeInput<
  Params,
  Search,
  Hash,
  SearchInput = Partial<Search>,
  HashInput = Hash,
> =
  RequiredKeys<Params> extends never
    ? PathBasedNormalizeInputWithoutParams<Params, Search, Hash, SearchInput, HashInput>
    : PathBasedNormalizeInputWithParams<Params, Search, Hash, SearchInput, HashInput>;

export type PathlessNormalizeInput<
  Search,
  Hash,
  SearchInput = Partial<Search>,
  HashInput = Hash,
> = {
  readonly pathname?: string;
  readonly params?: never;
} & SearchInputProperty<SearchInput> &
  HashInputProperty<HashInput>;

export type UrlNormalizeInput<
  Mode extends UrlMode,
  Params,
  Search,
  Hash,
  SearchInput = Partial<Search>,
  HashInput = Hash,
> = Mode extends 'path'
  ? PathBasedNormalizeInput<Params, Search, Hash, SearchInput, HashInput>
  : PathlessNormalizeInput<Search, Hash, SearchInput, HashInput>;

export type SearchInputProperty<SearchInput> = keyof SearchInput extends never
  ? { readonly search?: SearchInput }
  : RequiredKeys<SearchInput> extends never
    ? { readonly search?: SearchInput }
    : { readonly search: SearchInput };

export type SearchInputArgument<SearchInput> =
  RequiredKeys<SearchInput> extends never ? SearchInput | undefined : SearchInput;

export type HashInputProperty<HashInput> = undefined extends HashInput
  ? { readonly hash?: HashInput }
  : { readonly hash: HashInput };

export type BuildHashArguments<HashInput> = undefined extends HashInput
  ? [hash?: HashInput, options?: BuildUrlOptions]
  : [hash: HashInput, options?: BuildUrlOptions];

type RequiredKeys<Input> = {
  [Key in keyof Input]-?: {} extends Pick<Input, Key> ? never : Key;
}[keyof Input];

export type NormalizeUrlState<
  Mode extends UrlMode,
  Pathname,
  Params,
  Search,
  Hash,
  Input,
> = Mode extends 'path'
  ? UrlState<Pathname, Params, Search, Hash>
  : UrlState<PathnameFromPathlessNormalizeInput<Input>, EmptyParams, Search, Hash>;

export type PathnameFromPathlessNormalizeInput<Input> = Input extends {
  readonly pathname?: infer Pathname;
}
  ? Pathname extends string
    ? Pathname
    : string
  : string;

export type PathBuildMethod<Params> =
  RequiredKeys<Params> extends never ? (params?: Params) => string : (params: Params) => string;
