import type { RuntimeSearchSchema } from '../search/contracts.js';
import { compileSearchSchema } from '../search/compile-search-schema.js';
import type { StaticSearchDescriptor } from './contracts.js';
import { createStaticSearchSchema } from './create-static-search-schema.js';

export function compileStaticSearch(descriptor: StaticSearchDescriptor): RuntimeSearchSchema {
  const schema = createStaticSearchSchema(descriptor);
  compileSearchSchema(schema);

  return schema;
}
