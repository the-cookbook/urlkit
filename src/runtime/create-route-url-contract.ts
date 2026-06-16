import { compileStaticHash } from '../static/compile-static-hash.js';
import { compileStaticSearch } from '../static/compile-static-search.js';
import type {
  InferStaticUrlHash,
  InferStaticUrlHashBuildInput,
  InferStaticUrlSearch,
  InferStaticUrlSearchBuildInput,
  StaticUrlDescriptor,
  StaticUrlModeFromDescriptor,
} from '../static/contracts.js';
import { compilePath } from '../url/compile-path.js';
import { createUrlContract } from '../url/create-url-contract.js';
import type {
  NormalizedUrlDescriptor,
  ParamsFromPattern,
  PathnameFromPattern,
  RawParamsFromPattern,
  UrlContract,
} from '../url/contracts.js';
import type { PathMatchOptionsFromOptions } from '../url/path-match-contracts.js';
import type { EmptyParams } from '../contracts.js';
import type { CreateRouteUrlContractOptions } from './contracts.js';

export function createRouteUrlContract<
  const Descriptor extends StaticUrlDescriptor,
  const Options extends CreateRouteUrlContractOptions | undefined = undefined,
>(descriptor: Descriptor, options?: Options): RouteUrlContract<Descriptor, Options> {
  const resolvedOptions: CreateRouteUrlContractOptions = options ?? {};

  return createUrlContract<
    StaticUrlModeFromDescriptor<Descriptor>,
    RoutePathnameFromDescriptor<Descriptor>,
    RouteParamsFromDescriptor<Descriptor, Options>,
    InferStaticUrlSearch<Descriptor>,
    InferStaticUrlHash<Descriptor>,
    InferStaticUrlSearchBuildInput<Descriptor>,
    InferStaticUrlHashBuildInput<Descriptor>,
    RoutePathPatternFromDescriptor<Descriptor>,
    PathMatchOptionsFromOptions<Options>
  >(compileRouteUrlDescriptor(descriptor, options), resolvedOptions);
}

export interface RouteUrlContract<
  Descriptor extends StaticUrlDescriptor,
  Options extends CreateRouteUrlContractOptions | undefined = undefined,
> extends UrlContract<
  StaticUrlModeFromDescriptor<Descriptor>,
  RoutePathnameFromDescriptor<Descriptor>,
  RouteParamsFromDescriptor<Descriptor, Options>,
  InferStaticUrlSearch<Descriptor>,
  InferStaticUrlHash<Descriptor>,
  InferStaticUrlSearchBuildInput<Descriptor>,
  InferStaticUrlHashBuildInput<Descriptor>,
  RoutePathPatternFromDescriptor<Descriptor>,
  PathMatchOptionsFromOptions<Options>
> {}

export type RoutePathPatternFromDescriptor<Descriptor extends StaticUrlDescriptor> =
  Descriptor extends { readonly path: infer Pattern extends string } ? Pattern : string;

export type RoutePathnameFromDescriptor<Descriptor extends StaticUrlDescriptor> =
  Descriptor extends {
    readonly path: infer Pattern extends string;
  }
    ? PathnameFromPattern<Pattern>
    : string;

export type RouteParamsFromDescriptor<
  Descriptor extends StaticUrlDescriptor,
  Options extends CreateRouteUrlContractOptions | undefined,
> = Descriptor extends { readonly path: infer Pattern extends string }
  ? RouteParamsMode<Options> extends 'parsed'
    ? ParamsFromPattern<Pattern>
    : RawParamsFromPattern<Pattern>
  : EmptyParams;

type RouteParamsMode<Options extends CreateRouteUrlContractOptions | undefined> = Options extends {
  readonly params: 'parsed';
}
  ? 'parsed'
  : 'raw';

function compileRouteUrlDescriptor<
  Descriptor extends StaticUrlDescriptor,
  Options extends CreateRouteUrlContractOptions | undefined,
>(
  descriptor: Descriptor,
  options: Options,
): NormalizedUrlDescriptor<StaticUrlModeFromDescriptor<Descriptor>> {
  const mode = Object.prototype.hasOwnProperty.call(descriptor, 'path') ? 'path' : 'pathless';
  const paramsMode = options?.params ?? 'raw';

  const normalized = {
    mode,
    pattern: mode === 'path' ? descriptor.path : undefined,
    ...(mode === 'path' && descriptor.path !== undefined
      ? {
          path: compilePath(descriptor.path, {
            params: paramsMode,
            ...(options?.pathConstraints ? { pathConstraints: options.pathConstraints } : {}),
            ...(options?.pathMatch ? { pathMatch: options.pathMatch } : {}),
          }),
        }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(descriptor, 'search')
      ? { search: compileStaticSearch(descriptor.search ?? {}) }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(descriptor, 'hash') && descriptor.hash !== undefined
      ? { hash: compileStaticHash(descriptor.hash) }
      : {}),
  } as NormalizedUrlDescriptor<StaticUrlModeFromDescriptor<Descriptor>>;

  return Object.freeze(normalized);
}
