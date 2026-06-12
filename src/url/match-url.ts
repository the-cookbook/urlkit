import { UrlKitError } from '../errors/url-kit-error.js';
import type { ParseUrlOptions, UnknownSearchBehavior } from '../contracts.js';
import type { CompiledUrlDescriptor } from './compile-url-descriptor.js';
import { parseCompiledUrl } from './parse-compiled-url.js';

export function matchCompiledUrl(
  input: string | URL,
  compiled: CompiledUrlDescriptor,
  unknownSearch: UnknownSearchBehavior,
  options: ParseUrlOptions = {},
): boolean {
  try {
    parseCompiledUrl(input, compiled, unknownSearch, options);
    return true;
  } catch (error) {
    if (shouldRethrowMatchError(error, options)) {
      throw error;
    }

    return false;
  }
}

function shouldRethrowMatchError(error: unknown, options: ParseUrlOptions): boolean {
  if (!(error instanceof UrlKitError)) {
    return false;
  }

  return error.code === 'invalid-param' && (options.strict === true || Boolean(options.decode));
}
