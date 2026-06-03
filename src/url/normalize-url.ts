import type { NormalizeUrlState, UnknownSearchBehavior } from '../contracts.js';
import type { CompiledUrlDescriptor } from './compile-url-descriptor.js';
import { normalizeCompiledUrl } from './normalize-compiled-url.js';

export function normalizeUrl<
  Mode extends 'path' | 'pathless',
  Pathname,
  Params,
  Search,
  Hash,
  Input,
>(
  input: Input,
  compiled: CompiledUrlDescriptor<Mode>,
  unknownSearch: UnknownSearchBehavior,
): NormalizeUrlState<Mode, Pathname, Params, Search, Hash, Input> {
  return normalizeCompiledUrl<Mode, Pathname, Params, Search, Hash, Input>(
    input,
    compiled,
    unknownSearch,
  );
}
