import { createUrlContract } from './create-url-contract.js';
import { compileRuntimeUrlDescriptor } from './compile-runtime-url-descriptor.js';
import type {
  CreateUrlOptions,
  HashBuildInputFromRuntimeDescriptor,
  HashFromRuntimeDescriptor,
  ParamsFromRuntimeDescriptor,
  PathPatternFromRuntimeDescriptor,
  PathnameFromRuntimeDescriptor,
  RuntimeUrlDescriptor,
  SearchBuildInputFromRuntimeDescriptor,
  SearchFromRuntimeDescriptor,
  UrlContract,
  UrlModeFromRuntimeDescriptor,
} from './contracts.js';
import type { PathMatchOptionsFromOptions } from './path-match-contracts.js';

export function url<
  const Descriptor extends RuntimeUrlDescriptor,
  const Options extends CreateUrlOptions | undefined = undefined,
>(
  descriptor: Descriptor,
  options?: Options,
): UrlContract<
  UrlModeFromRuntimeDescriptor<Descriptor>,
  PathnameFromRuntimeDescriptor<Descriptor>,
  ParamsFromRuntimeDescriptor<Descriptor>,
  SearchFromRuntimeDescriptor<Descriptor>,
  HashFromRuntimeDescriptor<Descriptor>,
  SearchBuildInputFromRuntimeDescriptor<Descriptor>,
  HashBuildInputFromRuntimeDescriptor<Descriptor>,
  PathPatternFromRuntimeDescriptor<Descriptor>,
  PathMatchOptionsFromOptions<Options>
> {
  const resolvedOptions: CreateUrlOptions = options ?? {};

  return createUrlContract<
    UrlModeFromRuntimeDescriptor<Descriptor>,
    PathnameFromRuntimeDescriptor<Descriptor>,
    ParamsFromRuntimeDescriptor<Descriptor>,
    SearchFromRuntimeDescriptor<Descriptor>,
    HashFromRuntimeDescriptor<Descriptor>,
    SearchBuildInputFromRuntimeDescriptor<Descriptor>,
    HashBuildInputFromRuntimeDescriptor<Descriptor>,
    PathPatternFromRuntimeDescriptor<Descriptor>,
    PathMatchOptionsFromOptions<Options>
  >(compileRuntimeUrlDescriptor(descriptor, resolvedOptions), resolvedOptions);
}
