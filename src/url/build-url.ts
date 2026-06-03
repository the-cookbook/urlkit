import type { BuildUrlOptions, UrlBuildInput, UrlMode } from '../contracts.js';
import type { CompiledUrlDescriptor } from './compile-url-descriptor.js';
import { buildCompiledUrl } from './build-compiled-url.js';

export function buildUrl<Mode extends UrlMode, Params, Search, Hash>(
  input: UrlBuildInput<Mode, Params, Search, Hash>,
  compiled: CompiledUrlDescriptor<Mode>,
  options?: BuildUrlOptions,
): string {
  return buildCompiledUrl(input, compiled, options);
}
