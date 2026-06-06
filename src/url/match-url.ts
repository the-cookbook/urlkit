import { UrlKitError } from '../errors/url-kit-error.js';
import type { ParseUrlOptions, UnknownSearchBehavior } from '../contracts.js';
import type { CompiledUrlDescriptor } from './compile-url-descriptor.js';
import { parseCompiledUrl } from './parse-compiled-url.js';

export function matchCompiledUrl(
  input: string | URL,
  compiled: CompiledUrlDescriptor,
  unknownSearch: UnknownSearchBehavior,
  options: Pick<ParseUrlOptions, 'arrayFormat' | 'invalidSearch'> = {},
): boolean {
  try {
    parseCompiledUrl(input, compiled, unknownSearch, options);
    return true;
  } catch (error) {
    if (error instanceof UrlKitError) {
      return false;
    }

    throw error;
  }
}
