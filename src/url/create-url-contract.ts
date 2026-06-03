import type {
  BuildSearchOptions,
  BuildUrlOptions,
  EmptyParams,
  NormalizeUrlOptions,
  NormalizeUrlState,
  ParseRequestOptions,
  ParseUrlOptions,
  PatchSearchOptions,
  SearchInputArgument,
  UrlBuildInput,
  UrlNormalizeInput,
  UrlRequestInput,
  UrlSafeNormalizeResult,
  UrlSafeParseResult,
  UrlState,
} from '../contracts.js';
import { buildHash } from '../hash/build-hash.js';
import { parseHash } from '../hash/parse-hash.js';
import { buildCompiledSearch } from '../search/build-compiled-search.js';
import { parseRawSearch } from '../search/parse-raw-search.js';
import { parseCompiledSearch } from '../search/parse-compiled-search.js';
import { UrlKitError } from '../errors/url-kit-error.js';
import { normalizeCompiledUrl } from './normalize-compiled-url.js';
import { buildCompiledUrl } from './build-compiled-url.js';
import { parseCompiledUrl } from './parse-compiled-url.js';
import { resolveRequestUrlInput } from './parse-request.js';
import { matchCompiledUrl } from './match-url.js';
import { omitCompiledUrlSearch, pickCompiledUrlSearch } from './filter-compiled-url-search.js';
import { patchCompiledUrlSearch } from './patch-compiled-url-search.js';
import { replaceCompiledUrlSearch } from './replace-compiled-url-search.js';
import { compileUrlDescriptor } from './compile-url-descriptor.js';
import type {
  CreateUrlContractOptions,
  NormalizedUrlDescriptor,
  UrlContract,
} from './contracts.js';

export function createUrlContract<
  Mode extends 'path' | 'pathless',
  Pathname = Mode extends 'path' ? string : string,
  Params = Mode extends 'path' ? Record<string, string | number> : EmptyParams,
  Search = Record<string, unknown>,
  Hash = string | undefined,
  SearchInput = Partial<Search>,
  HashInput = Hash,
>(
  descriptor: NormalizedUrlDescriptor<Mode>,
  options: CreateUrlContractOptions = {},
): UrlContract<Mode, Pathname, Params, Search, Hash, SearchInput, HashInput> {
  const compiled = compileUrlDescriptor(descriptor);
  const unknownSearch = options.unknownSearch ?? 'strip';
  const arrayFormat = options.arrayFormat ?? 'repeat';

  const contract = {
    pattern: compiled.pattern,
    parse(
      input: string | URL,
      options?: ParseUrlOptions,
    ): UrlState<Pathname, Params, Search, Hash> {
      return parseCompiledUrl<Pathname, Params, Search, Hash>(
        input,
        compiled,
        options?.unknownSearch ?? unknownSearch,
        { arrayFormat: options?.arrayFormat ?? arrayFormat },
      );
    },
    safeParse(
      input: string | URL,
      options?: ParseUrlOptions,
    ): UrlSafeParseResult<Pathname, Params, Search, Hash> {
      try {
        return Object.freeze({
          success: true,
          data: parseCompiledUrl<Pathname, Params, Search, Hash>(
            input,
            compiled,
            options?.unknownSearch ?? unknownSearch,
            { arrayFormat: options?.arrayFormat ?? arrayFormat },
          ),
        });
      } catch (error) {
        return Object.freeze({
          success: false,
          error:
            error instanceof UrlKitError ? error : new UrlKitError('invalid-url', { cause: error }),
        });
      }
    },
    parseRequest(
      input: Request | UrlRequestInput,
      options?: ParseRequestOptions,
    ): UrlState<Pathname, Params, Search, Hash> {
      return parseCompiledUrl<Pathname, Params, Search, Hash>(
        resolveRequestUrlInput(input, options),
        compiled,
        options?.unknownSearch ?? unknownSearch,
        { arrayFormat: options?.arrayFormat ?? arrayFormat },
      );
    },
    safeParseRequest(
      input: Request | UrlRequestInput,
      options?: ParseRequestOptions,
    ): UrlSafeParseResult<Pathname, Params, Search, Hash> {
      try {
        return Object.freeze({
          success: true,
          data: parseCompiledUrl<Pathname, Params, Search, Hash>(
            resolveRequestUrlInput(input, options),
            compiled,
            options?.unknownSearch ?? unknownSearch,
            { arrayFormat: options?.arrayFormat ?? arrayFormat },
          ),
        });
      } catch (error) {
        return Object.freeze({
          success: false,
          error:
            error instanceof UrlKitError ? error : new UrlKitError('invalid-url', { cause: error }),
        });
      }
    },
    normalize<
      const Input extends UrlNormalizeInput<Mode, Params, Search, Hash, SearchInput, HashInput>,
    >(
      input: Input,
      options?: NormalizeUrlOptions,
    ): NormalizeUrlState<Mode, Pathname, Params, Search, Hash, Input> {
      return normalizeCompiledUrl<Mode, Pathname, Params, Search, Hash, Input>(
        input,
        compiled,
        options?.unknownSearch ?? unknownSearch,
      );
    },
    safeNormalize<
      const Input extends UrlNormalizeInput<Mode, Params, Search, Hash, SearchInput, HashInput>,
    >(
      input: Input,
      options?: NormalizeUrlOptions,
    ): UrlSafeNormalizeResult<Mode, Pathname, Params, Search, Hash, Input> {
      try {
        return Object.freeze({
          success: true,
          data: normalizeCompiledUrl<Mode, Pathname, Params, Search, Hash, Input>(
            input,
            compiled,
            options?.unknownSearch ?? unknownSearch,
          ),
        });
      } catch (error) {
        return Object.freeze({
          success: false,
          error:
            error instanceof UrlKitError ? error : new UrlKitError('invalid-url', { cause: error }),
        });
      }
    },
    build(
      input:
        | UrlBuildInput<Mode, Params, Search, Hash, SearchInput, HashInput>
        | UrlState<Pathname, Params, Search, Hash>,
      options?: BuildUrlOptions,
    ): string {
      return buildCompiledUrl<Mode, Params, Search, Hash, SearchInput, HashInput>(
        input as UrlBuildInput<Mode, Params, Search, Hash, SearchInput, HashInput>,
        compiled,
        mergeBuildOptions(arrayFormat, options),
      );
    },
    match(input: string | URL, options?: ParseUrlOptions): boolean {
      return matchCompiledUrl(input, compiled, options?.unknownSearch ?? unknownSearch, {
        arrayFormat: options?.arrayFormat ?? arrayFormat,
      });
    },
    // eslint-disable-next-line @typescript-eslint/unbound-method
    parsePathname: compiled.path?.parsePathname,
    buildPath: compiled.path?.buildPath,
    parseSearch(input: string | URLSearchParams, options?: ParseUrlOptions): Search {
      if (compiled.search) {
        return parseCompiledSearch(
          parseRawSearch(input),
          compiled.search,
          options?.unknownSearch ?? unknownSearch,
          { arrayFormat: options?.arrayFormat ?? arrayFormat },
        ).search as Search;
      }

      return Object.freeze({}) as Search;
    },
    parseHash(input: unknown): Hash {
      return compiled.hash
        ? (parseHash(input, compiled.hash.descriptor) as Hash)
        : (parseHash(input) as Hash);
    },
    buildSearch(search: SearchInputArgument<SearchInput>, options?: BuildSearchOptions): string {
      if (compiled.search) {
        return buildCompiledSearch(
          search as Record<string, unknown>,
          compiled.search,
          mergeBuildOptions(arrayFormat, options),
        );
      }

      return '';
    },
    buildHash(hash: Hash, options?: BuildUrlOptions): string {
      return compiled.hash
        ? buildHash(hash, compiled.hash.descriptor, options)
        : buildHash(hash, options);
    },
    withSearch(input: string | URL, search: Partial<Search>, options?: PatchSearchOptions): string {
      return patchCompiledUrlSearch(
        input,
        search,
        compiled,
        mergeBuildOptions(arrayFormat, options),
      );
    },
    replaceSearch(input: string | URL, search: SearchInput, options?: BuildSearchOptions): string {
      return replaceCompiledUrlSearch(
        input,
        search as Record<string, unknown>,
        compiled,
        mergeBuildOptions(arrayFormat, options),
      );
    },
    omitSearch(input: string | URL, keys: readonly string[], options?: BuildSearchOptions): string {
      return omitCompiledUrlSearch(input, keys, compiled, mergeBuildOptions(arrayFormat, options));
    },
    pickSearch(input: string | URL, keys: readonly string[], options?: BuildSearchOptions): string {
      return pickCompiledUrlSearch(input, keys, compiled, mergeBuildOptions(arrayFormat, options));
    },
  };

  return Object.freeze(contract) as unknown as UrlContract<
    Mode,
    Pathname,
    Params,
    Search,
    Hash,
    SearchInput,
    HashInput
  >;
}

function mergeBuildOptions<Options extends BuildUrlOptions>(
  arrayFormat: NonNullable<BuildUrlOptions['arrayFormat']>,
  options: Options | undefined,
): Options & BuildUrlOptions {
  return {
    ...options,
    arrayFormat: options?.arrayFormat ?? arrayFormat,
  } as Options & BuildUrlOptions;
}
