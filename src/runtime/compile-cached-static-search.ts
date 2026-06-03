import type { RuntimeSearchSchema } from '../search/contracts.js';
import { compileStaticSearch } from '../static/compile-static-search.js';
import type { StaticSearchDescriptor } from '../static/contracts.js';

const staticSearchCache = new WeakMap<StaticSearchDescriptor, RuntimeSearchSchema>();

export function compileCachedStaticSearch(schema: StaticSearchDescriptor): RuntimeSearchSchema {
  const cached = staticSearchCache.get(schema);

  if (cached) {
    return cached;
  }

  const compiled = compileStaticSearch(schema);
  staticSearchCache.set(schema, compiled);

  return compiled;
}
