import { UrlKitError } from '../errors/url-kit-error.js';
import type { UnknownSearchBehavior } from '../contracts.js';
import type { CompiledUrlDescriptor } from './compile-url-descriptor.js';
import { parseCompiledUrl } from './parse-compiled-url.js';

export function matchCompiledUrl(
  input: string | URL,
  compiled: CompiledUrlDescriptor,
  unknownSearch: UnknownSearchBehavior,
): boolean {
  try {
    parseCompiledUrl(input, compiled, unknownSearch);
    return true;
  } catch (error) {
    if (error instanceof UrlKitError) {
      return false;
    }

    return false;
  }
}
