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

export function url<const Descriptor extends RuntimeUrlDescriptor>(
  descriptor: Descriptor,
  options: CreateUrlOptions = {},
): UrlContract<
  UrlModeFromRuntimeDescriptor<Descriptor>,
  PathnameFromRuntimeDescriptor<Descriptor>,
  ParamsFromRuntimeDescriptor<Descriptor>,
  SearchFromRuntimeDescriptor<Descriptor>,
  HashFromRuntimeDescriptor<Descriptor>,
  SearchBuildInputFromRuntimeDescriptor<Descriptor>,
  HashBuildInputFromRuntimeDescriptor<Descriptor>,
  PathPatternFromRuntimeDescriptor<Descriptor>
> {
  return createUrlContract<
    UrlModeFromRuntimeDescriptor<Descriptor>,
    PathnameFromRuntimeDescriptor<Descriptor>,
    ParamsFromRuntimeDescriptor<Descriptor>,
    SearchFromRuntimeDescriptor<Descriptor>,
    HashFromRuntimeDescriptor<Descriptor>,
    SearchBuildInputFromRuntimeDescriptor<Descriptor>,
    HashBuildInputFromRuntimeDescriptor<Descriptor>,
    PathPatternFromRuntimeDescriptor<Descriptor>
  >(compileRuntimeUrlDescriptor(descriptor, options), options);
}
