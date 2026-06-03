import { compileStaticHash } from '../static/compile-static-hash.js';
import { compileStaticSearch } from '../static/compile-static-search.js';
import type {
  InferStaticUrlHash,
  InferStaticUrlSearch,
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
import type { EmptyParams } from '../contracts.js';
import type { CreateRouteUrlContractOptions } from './contracts.js';

export function createRouteUrlContract<
  const Descriptor extends StaticUrlDescriptor,
  const Options extends CreateRouteUrlContractOptions | undefined = undefined,
>(
  descriptor: Descriptor,
  options?: Options,
): UrlContract<
  StaticUrlModeFromDescriptor<Descriptor>,
  RoutePathnameFromDescriptor<Descriptor>,
  RouteParamsFromDescriptor<Descriptor, Options>,
  InferStaticUrlSearch<Descriptor>,
  InferStaticUrlHash<Descriptor>
> {
  return createUrlContract<
    StaticUrlModeFromDescriptor<Descriptor>,
    RoutePathnameFromDescriptor<Descriptor>,
    RouteParamsFromDescriptor<Descriptor, Options>,
    InferStaticUrlSearch<Descriptor>,
    InferStaticUrlHash<Descriptor>
  >(compileRouteUrlDescriptor(descriptor, options));
}

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
      ? { path: compilePath(descriptor.path, { params: paramsMode }) }
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
