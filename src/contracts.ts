import type { UrlKitError } from './errors/url-kit-error.js';

export type UrlMode = 'path' | 'pathless';

export type UnknownSearchBehavior = 'strip' | 'preserve' | 'error';

export type UnknownSearchParams = Readonly<Record<string, string | readonly string[]>>;

export type EmptyParams = Readonly<Record<never, never>>;

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

export interface ParseUrlOptions {
  readonly unknownSearch?: UnknownSearchBehavior;
}

export interface NormalizeUrlOptions {
  readonly unknownSearch?: UnknownSearchBehavior;
}

export interface BuildUrlOptions {
  readonly defaults?: 'include' | 'omit';
}

export interface BuildSearchOptions extends BuildUrlOptions {
  readonly arrayFormat?: 'repeat' | 'comma';
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

export type PathBasedBuildInputWithParams<Params, Search, Hash, SearchInput = Partial<Search>> = {
  readonly pathname?: never;
  readonly params: Params;
  readonly hash?: Hash;
} & SearchInputProperty<SearchInput>;

export type PathBasedBuildInputWithoutParams<Search, Hash, SearchInput = Partial<Search>> = {
  readonly pathname?: never;
  readonly params?: never | EmptyParams;
  readonly hash?: Hash;
} & SearchInputProperty<SearchInput>;

export type PathBasedBuildInput<
  Params,
  Search,
  Hash,
  SearchInput = Partial<Search>,
> = keyof Params extends never
  ? PathBasedBuildInputWithoutParams<Search, Hash, SearchInput>
  : PathBasedBuildInputWithParams<Params, Search, Hash, SearchInput>;

export type PathlessBuildInput<Search, Hash, SearchInput = Partial<Search>> = {
  readonly pathname?: string;
  readonly params?: never;
  readonly hash?: Hash;
} & SearchInputProperty<SearchInput>;

export type UrlBuildInput<
  Mode extends UrlMode,
  Params,
  Search,
  Hash,
  SearchInput = Partial<Search>,
> = Mode extends 'path'
  ? PathBasedBuildInput<Params, Search, Hash, SearchInput>
  : PathlessBuildInput<Search, Hash, SearchInput>;

export type PathBasedNormalizeInputWithParams<
  Params,
  Search,
  Hash,
  SearchInput = Partial<Search>,
> = {
  readonly pathname?: never;
  readonly params: Params;
  readonly hash?: Hash;
} & SearchInputProperty<SearchInput>;

export type PathBasedNormalizeInputWithoutParams<Search, Hash, SearchInput = Partial<Search>> = {
  readonly pathname?: never;
  readonly params?: never | EmptyParams;
  readonly hash?: Hash;
} & SearchInputProperty<SearchInput>;

export type PathBasedNormalizeInput<
  Params,
  Search,
  Hash,
  SearchInput = Partial<Search>,
> = keyof Params extends never
  ? PathBasedNormalizeInputWithoutParams<Search, Hash, SearchInput>
  : PathBasedNormalizeInputWithParams<Params, Search, Hash, SearchInput>;

export type PathlessNormalizeInput<Search, Hash, SearchInput = Partial<Search>> = {
  readonly pathname?: string;
  readonly params?: never;
  readonly hash?: Hash;
} & SearchInputProperty<SearchInput>;

export type UrlNormalizeInput<
  Mode extends UrlMode,
  Params,
  Search,
  Hash,
  SearchInput = Partial<Search>,
> = Mode extends 'path'
  ? PathBasedNormalizeInput<Params, Search, Hash, SearchInput>
  : PathlessNormalizeInput<Search, Hash, SearchInput>;

export type SearchInputProperty<SearchInput> = keyof SearchInput extends never
  ? { readonly search?: SearchInput }
  : RequiredKeys<SearchInput> extends never
    ? { readonly search?: SearchInput }
    : { readonly search: SearchInput };

export type SearchInputArgument<SearchInput> =
  RequiredKeys<SearchInput> extends never ? SearchInput | undefined : SearchInput;

type RequiredKeys<Input> = {
  [Key in keyof Input]-?: EmptyParams extends Pick<Input, Key> ? never : Key;
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

export type PathBuildMethod<Params> = keyof Params extends never
  ? (params?: never | EmptyParams) => string
  : (params: Params) => string;
